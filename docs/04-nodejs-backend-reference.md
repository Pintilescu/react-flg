# 04 — Node.js / Backend API Reference

> **Flagline** — Feature Flag SaaS
> Stack: React, Next.js 14+ (App Router), Node.js, TypeScript, PostgreSQL (Prisma), Redis
> Audience: Backend developer with 5+ years PHP/Laravel experience transitioning to this stack

This document is a **code-forward API reference** for the Flagline evaluation API service. It covers architecture, endpoint design, authentication, the flag evaluation engine, Redis integration, SSE streaming, rate limiting, error handling, database access, and testing — with production-grade TypeScript implementations throughout.

---

## Table of Contents

1. [The Separate Evaluation API Service](#1-the-separate-evaluation-api-service)
2. [API Design: RESTful Endpoints](#2-api-design-restful-endpoints)
3. [Authentication Middleware: API Key Validation](#3-authentication-middleware-api-key-validation)
4. [Flag Evaluation Engine](#4-flag-evaluation-engine)
5. [Redis Integration](#5-redis-integration)
6. [SSE Endpoint Implementation](#6-sse-endpoint-implementation)
7. [Rate Limiting Strategy](#7-rate-limiting-strategy)
8. [Error Handling, Logging, Health Checks](#8-error-handling-logging-health-checks)
9. [Database Access Layer with Prisma](#9-database-access-layer-with-prisma)
10. [Testing](#10-testing)

---

## 1. The Separate Evaluation API Service

### Why a Separate Service

Flagline has two backend surfaces:

| Concern | Dashboard API | Evaluation API |
|---|---|---|
| Runtime | Next.js App Router (Route Handlers / Server Actions) | Standalone Fastify process |
| Traffic shape | Low-volume CRUD from logged-in users | High-volume, latency-critical reads from SDKs |
| Scaling axis | Scale with dashboard traffic (modest) | Scale independently to thousands of req/s |
| Connection model | Short-lived request/response | Long-lived SSE streams + short-lived POST |
| Deploy target | Vercel / containerized Next.js | Dedicated container(s) behind a load balancer |

The evaluation API is the hot path. Every page load in a customer's app calls `POST /v1/evaluate/batch`. Mixing this with Next.js means SSE connections tie up the serverless/edge function pool, cold starts add latency, and you cannot tune the Node.js process (memory, keep-alive, cluster) independently.

> **Coming from Laravel:** Think of this like running a separate Lumen microservice for your read-heavy public API while keeping the main Laravel app for the admin panel. Same database, different process, different deploy, different scaling profile.

### Express vs Fastify

Both work. We recommend **Fastify** for Flagline because:

- **Performance.** Fastify's radix-tree router and schema-based serialization make it roughly 2x faster than Express for JSON responses. For an evaluation API that returns small JSON payloads at high volume, this matters.
- **Schema validation built-in.** Fastify uses JSON Schema to validate request/response shapes and to compile serializers. Faster than adding `express-validator` or `zod` as middleware.
- **First-class TypeScript.** Fastify's type provider system (`@fastify/type-provider-typebox`) gives end-to-end type safety from schema to handler without code generation.
- **Plugin architecture.** Fastify's encapsulated plugin system is cleaner than Express's middleware-chain-mutates-global-app pattern.

> **Coming from Laravel:** Fastify's plugin system is conceptually similar to Laravel's service providers -- each plugin registers its own routes, decorators, and hooks in an encapsulated scope. Express is more like a raw middleware stack where order is everything.

### Project Structure

```
apps/
  evaluation-api/
    src/
      index.ts              # Entry point: bootstrap & start
      app.ts                # Fastify instance creation & plugin registration
      config.ts             # Environment variable parsing (typed)
      routes/
        evaluate.ts         # POST /v1/evaluate, POST /v1/evaluate/batch
        stream.ts           # GET /v1/flags/stream (SSE)
        health.ts           # GET /v1/health
      middleware/
        auth.ts             # API key extraction & validation
        rateLimit.ts        # Per-key sliding window rate limiter
        requestId.ts        # Attach unique request ID
      services/
        evaluationEngine.ts # Pure-function flag evaluation logic
        flagStore.ts        # Load flags from cache/DB, cache-aside pattern
        sseManager.ts       # Track SSE clients, fan-out updates
        redisClient.ts      # ioredis singleton + pub/sub subscriber
      utils/
        murmurhash.ts       # MurmurHash3 implementation
        errors.ts           # Custom error classes
        logger.ts           # pino logger setup
        envelope.ts         # Response envelope helpers
      types/
        flag.ts             # Flag, Rule, Condition, EvaluationResult types
        api.ts              # Request/response schemas
    tests/
      unit/
        evaluationEngine.test.ts
        murmurhash.test.ts
      integration/
        evaluate.test.ts
        stream.test.ts
    prisma/
      schema.prisma
    tsconfig.json
    package.json
```

> **Coming from Laravel:** Roughly: `routes/` = `routes/api.php`, `middleware/` = `app/Http/Middleware/`, `services/` = `app/Services/`, `utils/` = `app/Support/`, `types/` = a combination of Form Requests and DTOs.

### Fastify Setup with TypeScript

```typescript
// apps/evaluation-api/src/app.ts
import Fastify, { FastifyInstance } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import cors from "@fastify/cors";
import { logger } from "./utils/logger";
import { registerEvaluateRoutes } from "./routes/evaluate";
import { registerStreamRoutes } from "./routes/stream";
import { registerHealthRoutes } from "./routes/health";
import { authPlugin } from "./middleware/auth";
import { rateLimitPlugin } from "./middleware/rateLimit";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    requestIdHeader: "x-request-id",
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
  });

  await app.register(authPlugin);
  await app.register(rateLimitPlugin);

  await app.register(registerEvaluateRoutes, { prefix: "/v1" });
  await app.register(registerStreamRoutes, { prefix: "/v1" });
  await app.register(registerHealthRoutes, { prefix: "/v1" });

  return app;
}
```

### Startup Sequence

```typescript
// apps/evaluation-api/src/index.ts
import { buildApp } from "./app";
import { config } from "./config";
import { prisma } from "./services/prismaClient";
import { redis, redisSub } from "./services/redisClient";
import { sseManager } from "./services/sseManager";
import { FastifyInstance } from "fastify";

async function main() {
  // 1. Verify database connection
  await prisma.$connect();
  console.log("[startup] PostgreSQL connected");

  // 2. Verify Redis connection (ioredis connects lazily -- ping to force it)
  await redis.ping();
  console.log("[startup] Redis connected");

  // 3. Subscribe to flag-change channel for real-time updates
  await redisSub.subscribe("flagline:flag-updates");
  redisSub.on("message", (channel, message) => {
    if (channel === "flagline:flag-updates") {
      sseManager.broadcast(JSON.parse(message));
    }
  });
  console.log("[startup] Redis pub/sub subscribed");

  // 4. Build and start Fastify
  const app = await buildApp();
  setupGracefulShutdown(app);
  await app.listen({ port: config.PORT, host: "0.0.0.0" });
  console.log(`[startup] Evaluation API listening on :${config.PORT}`);
}

main().catch((err) => {
  console.error("[startup] Fatal error during bootstrap:", err);
  process.exit(1);
});
```

### Graceful Shutdown

Node.js does not shut down gracefully by default. When Kubernetes sends SIGTERM, you must: stop accepting new connections, drain in-flight requests, close SSE connections, disconnect Redis and Prisma, then exit.

```typescript
function setupGracefulShutdown(app: FastifyInstance) {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`[shutdown] Received ${signal}, starting graceful shutdown...`);

      await app.close();
      console.log("[shutdown] Fastify closed");

      sseManager.closeAll();
      console.log("[shutdown] SSE connections closed");

      redis.disconnect();
      redisSub.disconnect();
      console.log("[shutdown] Redis disconnected");

      await prisma.$disconnect();
      console.log("[shutdown] Prisma disconnected");

      process.exit(0);
    });
  }
}
```

> **Coming from Laravel:** PHP processes die after each request (unless you use Octane/Swoole). In Node.js, the process is long-lived. Skipping graceful shutdown means active requests get killed mid-flight, SSE clients get no close frame, and database connections leak.

### Config Module

```typescript
// apps/evaluation-api/src/config.ts
import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3100),
  DATABASE_URL: z.string(),
  DATABASE_REPLICA_URL: z.string().optional(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  APP_VERSION: z.string().default("0.0.0"),
});

export const config = configSchema.parse(process.env);
export type Config = z.infer<typeof configSchema>;
```

> **Coming from Laravel:** This replaces `config/app.php` + `.env` parsing. Zod validates at startup -- if `DATABASE_URL` is missing, the process crashes immediately with a clear error instead of failing later on the first query.

---

## 2. API Design: RESTful Endpoints

### Dashboard API (Next.js Route Handlers)

These live in the Next.js app and handle CRUD for the management UI:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | List projects for tenant |
| `POST` | `/api/projects` | Create project |
| `GET` | `/api/projects/:id/environments` | List environments |
| `POST` | `/api/projects/:id/flags` | Create flag |
| `PATCH` | `/api/flags/:id` | Update flag |
| `DELETE` | `/api/flags/:id` | Delete flag |
| `PUT` | `/api/flags/:id/rules` | Replace rules for flag |
| `POST` | `/api/projects/:id/api-keys` | Generate API key |
| `DELETE` | `/api/api-keys/:id` | Revoke API key |

These use Next.js server-side auth (session cookie via `next-auth` or Clerk) and are standard CRUD -- not covered in depth here.

### Evaluation API Endpoints

#### `POST /v1/evaluate` -- Single Flag

Request:

```json
{
  "flagKey": "new-checkout-flow",
  "context": {
    "userId": "user_8a3f",
    "email": "alice@acme.com",
    "country": "US",
    "plan": "pro",
    "appVersion": "2.4.1"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "flagKey": "new-checkout-flow",
    "value": true,
    "variationKey": "enabled",
    "reason": "RULE_MATCH",
    "ruleId": "rule_pro_users",
    "evaluationTimeMs": 0.42
  }
}
```

#### `POST /v1/evaluate/batch` -- SDK Bootstrap

Request:

```json
{
  "context": {
    "userId": "user_8a3f",
    "email": "alice@acme.com",
    "country": "US",
    "plan": "pro"
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "flags": {
      "new-checkout-flow": {
        "value": true,
        "variationKey": "enabled",
        "reason": "RULE_MATCH"
      },
      "dark-mode": {
        "value": false,
        "variationKey": "disabled",
        "reason": "DEFAULT_VALUE"
      },
      "pricing-experiment": {
        "value": "variant-b",
        "variationKey": "variant-b",
        "reason": "PERCENTAGE_ROLLOUT"
      }
    },
    "environment": "production",
    "evaluatedAt": "2025-06-15T10:30:00.000Z"
  }
}
```

#### `GET /v1/flags/stream` -- SSE Real-Time Updates

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

id: evt_001
event: flag-updated
data: {"flagKey":"new-checkout-flow","value":true,"timestamp":"2025-06-15T10:31:00.000Z"}

:keepalive

id: evt_002
event: flag-updated
data: {"flagKey":"dark-mode","value":true,"timestamp":"2025-06-15T10:32:00.000Z"}
```

#### `GET /v1/health` -- Health Check

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 84321,
    "checks": {
      "database": { "status": "up", "latencyMs": 2 },
      "redis": { "status": "up", "latencyMs": 1 },
      "memory": { "heapUsedMB": 87, "heapTotalMB": 256, "rssMB": 310 }
    },
    "version": "1.3.0"
  }
}
```

### TypeScript Request/Response Types

```typescript
// apps/evaluation-api/src/types/api.ts

export interface EvaluationContext {
  userId?: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface EvaluateRequest {
  flagKey: string;
  context: EvaluationContext;
}

export interface EvaluationResult {
  flagKey: string;
  value: boolean | string | number | object;
  variationKey: string;
  reason:
    | "RULE_MATCH"
    | "PERCENTAGE_ROLLOUT"
    | "DEFAULT_VALUE"
    | "FLAG_DISABLED"
    | "FLAG_NOT_FOUND"
    | "ERROR";
  ruleId?: string;
  evaluationTimeMs?: number;
}

export interface BatchEvaluateRequest {
  context: EvaluationContext;
}

export interface BatchEvaluateResponse {
  success: true;
  data: {
    flags: Record<
      string,
      Omit<EvaluationResult, "flagKey" | "evaluationTimeMs">
    >;
    environment: string;
    evaluatedAt: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### Response Envelope Helpers

```typescript
// apps/evaluation-api/src/utils/envelope.ts
import { FastifyReply } from "fastify";

export function success<T>(reply: FastifyReply, data: T, statusCode = 200) {
  return reply.status(statusCode).send({ success: true, data });
}

export function error(
  reply: FastifyReply,
  code: string,
  message: string,
  statusCode = 500,
  details?: unknown
) {
  return reply.status(statusCode).send({
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  });
}
```

### API Versioning Strategy

Prefix all evaluation endpoints with `/v1`. When shipping breaking changes, introduce `/v2` alongside `/v1` and add a sunset header:

```typescript
app.addHook("onSend", async (request, reply) => {
  if (request.url.startsWith("/v1")) {
    reply.header("Sunset", "Sat, 01 Mar 2026 00:00:00 GMT");
    reply.header("Deprecation", "true");
    reply.header("Link", '</v2>; rel="successor-version"');
  }
});
```

> **Coming from Laravel:** This is the same pattern as `Route::prefix('v1')->group(...)` and `Route::prefix('v2')->group(...)` in `routes/api.php`. Fastify's `register` with `prefix` creates an encapsulated scope -- like a Laravel route group.

---

## 3. Authentication Middleware: API Key Validation

### API Key Format

```
fl_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
fl_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
^^  ^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
|   |     32-character random hex
|   Environment indicator: "live" or "test"
Prefix: "fl" (Flagline)
```

### API Key Generation (Dashboard Side)

```typescript
import crypto from "node:crypto";

export function generateApiKey(environment: "live" | "test"): {
  key: string;
  keyHash: string;
  keyPrefix: string;
} {
  const random = crypto.randomBytes(16).toString("hex");
  const key = `fl_${environment}_${random}`;
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const keyPrefix = key.slice(0, 12);
  return { key, keyHash, keyPrefix };
}
```

We store the **hash** in the database, never the raw key. Identical to how Laravel stores hashed API tokens in `personal_access_tokens`.

### Auth Middleware Implementation

```typescript
// apps/evaluation-api/src/middleware/auth.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import crypto from "node:crypto";
import { redis } from "../services/redisClient";
import { prisma } from "../services/prismaClient";
import { logger } from "../utils/logger";

declare module "fastify" {
  interface FastifyRequest {
    apiKey: {
      id: string;
      tenantId: string;
      projectId: string;
      environmentId: string;
      environment: "live" | "test";
      planTier: "starter" | "pro" | "enterprise";
    };
  }
}

interface CachedKeyData {
  id: string;
  tenantId: string;
  projectId: string;
  environmentId: string;
  environment: "live" | "test";
  planTier: "starter" | "pro" | "enterprise";
}

const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = "flagline:apikey:";

function extractApiKey(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const xApiKey = request.headers["x-api-key"];
  if (typeof xApiKey === "string") {
    return xApiKey;
  }
  return null;
}

async function authHandler(request: FastifyRequest, reply: FastifyReply) {
  // Skip auth for health check
  if (request.url === "/v1/health") return;

  // 1. Extract key from headers
  const rawKey = extractApiKey(request);
  if (!rawKey) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "MISSING_API_KEY",
        message:
          "API key required. Pass via Authorization: Bearer <key> or X-API-Key header.",
      },
    });
  }

  // 2. Validate format
  const envMatch = rawKey.match(/^fl_(live|test)_[a-f0-9]{32}$/);
  if (!envMatch) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "INVALID_API_KEY_FORMAT",
        message: "API key format is invalid.",
      },
    });
  }

  // 3. Hash the key for lookup
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  // 4. Check Redis cache first
  const cached = await redis.get(`${CACHE_PREFIX}${keyHash}`);
  if (cached) {
    request.apiKey = JSON.parse(cached) as CachedKeyData;
    return;
  }

  // 5. Look up in database
  const keyRecord = await prisma.apiKey.findFirst({
    where: { keyHash, revokedAt: null },
    include: {
      project: { include: { tenant: true } },
      environment: true,
    },
  });

  if (!keyRecord) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "INVALID_API_KEY",
        message: "API key is invalid or has been revoked.",
      },
    });
  }

  // 6. Build the auth context
  const keyData: CachedKeyData = {
    id: keyRecord.id,
    tenantId: keyRecord.project.tenantId,
    projectId: keyRecord.projectId,
    environmentId: keyRecord.environmentId,
    environment: keyRecord.environment.type as "live" | "test",
    planTier: keyRecord.project.tenant.planTier as CachedKeyData["planTier"],
  };

  // 7. Cache in Redis
  await redis.setex(
    `${CACHE_PREFIX}${keyHash}`,
    CACHE_TTL_SECONDS,
    JSON.stringify(keyData)
  );

  // 8. Attach to request
  request.apiKey = keyData;
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  app.addHook("onRequest", authHandler);
});
```

### Key Rotation

When a customer rotates their API key, the old key stays active for a grace period (e.g., 24 hours). Both old and new keys resolve to the same project/environment. The `revokedAt: null` check in the query handles this. To invalidate a cached key immediately upon revocation:

```typescript
export async function invalidateApiKeyCache(keyHash: string): Promise<void> {
  await redis.del(`${CACHE_PREFIX}${keyHash}`);
}
```

> **Coming from Laravel:** This is directly analogous to `$request->bearerToken()` in a Laravel middleware, then `PersonalAccessToken::findToken($token)`. The Redis caching layer is something you would implement yourself in Laravel. In Node.js, there is no built-in token system -- you build it yourself, which gives you more control.

---

## 4. Flag Evaluation Engine

This is the heart of Flagline. The evaluation engine is a **pure function** -- no side effects, no database calls, no Redis. It takes a flag configuration and an evaluation context, and returns a result. Trivially testable.

### The Core Algorithm

```
1. Look up flag by key
2. If flag not found -> return FLAG_NOT_FOUND with default
3. If flag.enabled === false -> return FLAG_DISABLED with off-value
4. For each rule in flag.rules (sorted by priority, ascending):
   a. Evaluate all conditions in the rule against the context
   b. If all conditions match (AND logic within a rule):
      - If the rule has a percentage rollout:
        -> Hash(flagKey + userId) -> 0..99
        -> If hash < rule.percentage -> return rule's variation
        -> Else -> continue to next rule
      - Else -> return rule's variation (100% match)
5. If no rule matched -> return flag's default variation with reason DEFAULT_VALUE
```

### TypeScript Types for Flag Configuration

```typescript
// apps/evaluation-api/src/types/flag.ts

export type FlagValue = boolean | string | number | Record<string, unknown>;

export interface FlagVariation {
  key: string;
  value: FlagValue;
}

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "in"
  | "not_in"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "regex"
  | "semver_gt"
  | "semver_lt"
  | "semver_gte"
  | "semver_lte"
  | "exists"
  | "not_exists";

export interface RuleCondition {
  attribute: string;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

export interface FlagRule {
  id: string;
  priority: number;
  conditions: RuleCondition[];
  variationKey: string;
  percentage?: number;
  enabled: boolean;
}

export interface FlagConfig {
  key: string;
  enabled: boolean;
  variations: FlagVariation[];
  rules: FlagRule[];
  defaultVariation: string;
  offVariation: string;
}
```

### MurmurHash3 Implementation

Percentage rollouts need **deterministic** hashing. The same `(flagKey, userId)` pair must always produce the same bucket. `Math.random()` is useless because a user would get a different flag value on every request.

```typescript
// apps/evaluation-api/src/utils/murmurhash.ts

export function murmurhash3(key: string, seed: number = 0): number {
  let h1 = seed >>> 0;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  const len = key.length;
  const roundedEnd = len & ~0x3;

  for (let i = 0; i < roundedEnd; i += 4) {
    let k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(i + 1) & 0xff) << 8) |
      ((key.charCodeAt(i + 2) & 0xff) << 16) |
      ((key.charCodeAt(i + 3) & 0xff) << 24);

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1 = Math.imul(h1, 5) + 0xe6546b64;
  }

  let k1 = 0;
  switch (len & 3) {
    case 3:
      k1 ^= (key.charCodeAt(roundedEnd + 2) & 0xff) << 16;
    // falls through
    case 2:
      k1 ^= (key.charCodeAt(roundedEnd + 1) & 0xff) << 8;
    // falls through
    case 1:
      k1 ^= key.charCodeAt(roundedEnd) & 0xff;
      k1 = Math.imul(k1, c1);
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = Math.imul(k1, c2);
      h1 ^= k1;
  }

  h1 ^= len;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35);
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
}

export function getBucket(flagKey: string, userId: string): number {
  const hash = murmurhash3(`${flagKey}:${userId}`);
  return hash % 100;
}
```

| Property | MurmurHash3 | Math.random() |
|---|---|---|
| Deterministic | Yes -- same input, same output | No |
| User stickiness | User always gets same bucket | Different every call |
| Cross-instance consistent | Same result on any server | Different per process |
| A/B test integrity | Users stay in their variant | Users flip randomly |

### Condition Operator Implementation

```typescript
// apps/evaluation-api/src/services/evaluationEngine.ts (operator section)
import { gt, lt, gte, lte } from "semver";
import { RuleCondition } from "../types/flag";
import { EvaluationContext } from "../types/api";

function evaluateCondition(
  condition: RuleCondition,
  context: EvaluationContext
): boolean {
  const { attribute, operator, value } = condition;
  const actual = context[attribute];

  if (operator === "exists") return actual !== undefined && actual !== null;
  if (operator === "not_exists") return actual === undefined || actual === null;

  if (actual === undefined || actual === null) return false;

  switch (operator) {
    case "equals":
      return String(actual) === String(value);
    case "not_equals":
      return String(actual) !== String(value);
    case "contains":
      return String(actual).includes(String(value));
    case "not_contains":
      return !String(actual).includes(String(value));
    case "starts_with":
      return String(actual).startsWith(String(value));
    case "ends_with":
      return String(actual).endsWith(String(value));
    case "in":
      return Array.isArray(value) && value.map(String).includes(String(actual));
    case "not_in":
      return (
        Array.isArray(value) && !value.map(String).includes(String(actual))
      );
    case "gt":
      return Number(actual) > Number(value);
    case "lt":
      return Number(actual) < Number(value);
    case "gte":
      return Number(actual) >= Number(value);
    case "lte":
      return Number(actual) <= Number(value);
    case "regex":
      try {
        return new RegExp(String(value)).test(String(actual));
      } catch {
        return false;
      }
    case "semver_gt":
      return gt(String(actual), String(value));
    case "semver_lt":
      return lt(String(actual), String(value));
    case "semver_gte":
      return gte(String(actual), String(value));
    case "semver_lte":
      return lte(String(actual), String(value));
    default:
      return false;
  }
}
```

### Complete Evaluation Engine

```typescript
// apps/evaluation-api/src/services/evaluationEngine.ts
import {
  FlagConfig,
  FlagVariation,
} from "../types/flag";
import { EvaluationContext, EvaluationResult } from "../types/api";
import { getBucket } from "../utils/murmurhash";

export function evaluateFlag(
  flag: FlagConfig | null | undefined,
  flagKey: string,
  context: EvaluationContext
): EvaluationResult {
  const startTime = performance.now();

  // Flag not found
  if (!flag) {
    return {
      flagKey,
      value: false,
      variationKey: "__not_found__",
      reason: "FLAG_NOT_FOUND",
      evaluationTimeMs: elapsed(startTime),
    };
  }

  // Flag disabled (kill switch)
  if (!flag.enabled) {
    const offVariation = findVariation(flag.variations, flag.offVariation);
    return {
      flagKey,
      value: offVariation?.value ?? false,
      variationKey: flag.offVariation,
      reason: "FLAG_DISABLED",
      evaluationTimeMs: elapsed(startTime),
    };
  }

  // Evaluate rules in priority order
  const sortedRules = [...flag.rules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    const allConditionsMatch = rule.conditions.every((condition) =>
      evaluateCondition(condition, context)
    );

    if (!allConditionsMatch) continue;

    // Conditions matched -- check percentage rollout
    if (rule.percentage !== undefined && rule.percentage < 100) {
      const userId = context.userId ?? context.id ?? "";
      if (typeof userId !== "string" || userId === "") {
        continue; // No user ID for bucketing -- skip
      }
      const bucket = getBucket(flagKey, userId);
      if (bucket >= rule.percentage) {
        continue; // Outside rollout percentage
      }
    }

    // Rule matched
    const variation = findVariation(flag.variations, rule.variationKey);
    return {
      flagKey,
      value: variation?.value ?? true,
      variationKey: rule.variationKey,
      reason:
        rule.percentage !== undefined ? "PERCENTAGE_ROLLOUT" : "RULE_MATCH",
      ruleId: rule.id,
      evaluationTimeMs: elapsed(startTime),
    };
  }

  // No rule matched -- return default
  const defaultVariation = findVariation(
    flag.variations,
    flag.defaultVariation
  );
  return {
    flagKey,
    value: defaultVariation?.value ?? false,
    variationKey: flag.defaultVariation,
    reason: "DEFAULT_VALUE",
    evaluationTimeMs: elapsed(startTime),
  };
}

function findVariation(
  variations: FlagVariation[],
  key: string
): FlagVariation | undefined {
  return variations.find((v) => v.key === key);
}

function elapsed(start: number): number {
  return Math.round((performance.now() - start) * 100) / 100;
}
```

> **Coming from Laravel:** This is like a "Policy" or "Gate" but for feature flags. In Laravel, you write `Gate::allows('access-feature', $user)`. Here the "gate" is the evaluation engine, the "policy" is the set of rules, and the "user" is the context object. The key difference is this is a pure function -- no service container, no dependency injection, no Eloquent calls.

---

## 5. Redis Integration

### Client Setup with ioredis

We use **ioredis** (not the older `node-redis` package). We need two clients: one for commands, one for pub/sub. Redis requires a dedicated connection for SUBSCRIBE -- once a connection enters subscriber mode, it cannot run other commands.

```typescript
// apps/evaluation-api/src/services/redisClient.ts
import Redis from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";

function createRedisClient(name: string): Redis {
  const client = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      if (times > 10) {
        logger.error(`[redis:${name}] Too many retries, giving up`);
        return null;
      }
      const delay = Math.min(times * 200, 5000);
      logger.warn(
        `[redis:${name}] Reconnecting in ${delay}ms (attempt ${times})`
      );
      return delay;
    },
    lazyConnect: false,
  });

  client.on("connect", () => logger.info(`[redis:${name}] Connected`));
  client.on("error", (err) =>
    logger.error(`[redis:${name}] Error: ${err.message}`)
  );
  client.on("close", () =>
    logger.warn(`[redis:${name}] Connection closed`)
  );

  return client;
}

export const redis = createRedisClient("commands");
export const redisSub = createRedisClient("subscriber");
```

> **Coming from Laravel:** In Laravel, you use `Cache::get()` / `Cache::put()` which abstracts the Redis client. In PHP, each worker creates its own Redis connection per request. In Node.js, you create the connection **once** at startup and it persists for the lifetime of the process.

### Caching Flag Configurations

```typescript
// apps/evaluation-api/src/services/flagStore.ts
import { redis } from "./redisClient";
import { prisma } from "./prismaClient";
import { FlagConfig } from "../types/flag";
import { logger } from "../utils/logger";
import { LRUCache } from "lru-cache";

const FLAG_CACHE_PREFIX = "flagline:flags:";
const FLAG_CACHE_TTL = 60; // seconds

// Three-tier caching: in-memory LRU -> Redis -> PostgreSQL
const localCache = new LRUCache<string, FlagConfig[]>({
  max: 500,
  ttl: 120_000, // 2 minutes
});

export async function getFlagsForEnvironment(
  environmentId: string
): Promise<FlagConfig[]> {
  const cacheKey = `${FLAG_CACHE_PREFIX}${environmentId}`;

  // Tier 1: In-memory LRU
  const inMemory = localCache.get(environmentId);
  if (inMemory) return inMemory;

  // Tier 2: Redis
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const flags = JSON.parse(cached) as FlagConfig[];
      localCache.set(environmentId, flags);
      return flags;
    }
  } catch (err) {
    logger.warn({ err }, "Redis cache read failed, falling back to DB");
  }

  // Tier 3: Database
  const flags = await loadFlagsFromDatabase(environmentId);
  localCache.set(environmentId, flags);

  try {
    await redis.setex(cacheKey, FLAG_CACHE_TTL, JSON.stringify(flags));
  } catch (err) {
    logger.warn({ err }, "Redis cache write failed");
  }

  return flags;
}

async function loadFlagsFromDatabase(
  environmentId: string
): Promise<FlagConfig[]> {
  const dbFlags = await prisma.flag.findMany({
    where: { environmentId },
    include: {
      variations: true,
      rules: {
        include: { conditions: true },
        orderBy: { priority: "asc" },
      },
    },
  });

  return dbFlags.map((f) => ({
    key: f.key,
    enabled: f.enabled,
    variations: f.variations.map((v) => ({
      key: v.key,
      value: v.value as FlagConfig["variations"][0]["value"],
    })),
    rules: f.rules.map((r) => ({
      id: r.id,
      priority: r.priority,
      conditions: r.conditions.map((c) => ({
        attribute: c.attribute,
        operator: c.operator as any,
        value: c.value as any,
      })),
      variationKey: r.variationKey,
      percentage: r.percentage ?? undefined,
      enabled: r.enabled,
    })),
    defaultVariation: f.defaultVariationKey,
    offVariation: f.offVariationKey,
  }));
}

export async function getFlag(
  environmentId: string,
  flagKey: string
): Promise<FlagConfig | undefined> {
  const flags = await getFlagsForEnvironment(environmentId);
  return flags.find((f) => f.key === flagKey);
}
```

### Pub/Sub for Real-Time Flag Change Propagation

**Publisher side (Next.js dashboard API):**

```typescript
// In the Next.js flag update route handler
import { redis } from "@/lib/redis";

export async function updateFlag(flagId: string, data: UpdateFlagInput) {
  const flag = await prisma.flag.update({
    where: { id: flagId },
    data,
    include: { environment: true },
  });

  // Invalidate cache
  await redis.del(`flagline:flags:${flag.environmentId}`);

  // Publish change event
  await redis.publish(
    "flagline:flag-updates",
    JSON.stringify({
      type: "flag-updated",
      environmentId: flag.environmentId,
      flagKey: flag.key,
      timestamp: new Date().toISOString(),
    })
  );

  return flag;
}
```

**Subscriber side (already wired in startup):**

```typescript
redisSub.on("message", (channel, message) => {
  if (channel === "flagline:flag-updates") {
    const event = JSON.parse(message);
    redis.del(`flagline:flags:${event.environmentId}`);
    localCache.delete(event.environmentId);
    sseManager.broadcast(event);
  }
});
```

### Cache Invalidation

```typescript
export async function invalidateFlagCache(
  environmentId: string
): Promise<void> {
  await redis.del(`${FLAG_CACHE_PREFIX}${environmentId}`);
  localCache.delete(environmentId);
}

export async function invalidateAllFlagCaches(
  environmentIds: string[]
): Promise<void> {
  if (environmentIds.length === 0) return;
  const keys = environmentIds.map((id) => `${FLAG_CACHE_PREFIX}${id}`);
  await redis.del(...keys);
  for (const id of environmentIds) localCache.delete(id);
}
```

> **Coming from Laravel:** Redis pub/sub is similar to Laravel's event broadcasting with the Redis driver. The `broadcastOn()` method specifies a channel, and listeners receive the event. Same fire-and-forget semantics -- if no one is listening, the event vanishes.

---

## 6. SSE Endpoint Implementation

### How SSE Works

Server-Sent Events is a unidirectional protocol. The server sends events; the client cannot send data back. It is simpler than WebSocket and works over standard HTTP.

- Each event is separated by a blank line (`\n\n`).
- `id:` sets the last event ID (used for reconnection).
- `event:` sets the event type.
- `data:` is the payload.
- Lines starting with `:` are comments -- used for keep-alive.

### SSE Manager -- Connection Tracking and Fan-Out

```typescript
// apps/evaluation-api/src/services/sseManager.ts
import { FastifyReply } from "fastify";
import { logger } from "../utils/logger";
import crypto from "node:crypto";

interface SSEClient {
  id: string;
  environmentId: string;
  reply: FastifyReply;
  connectedAt: Date;
  lastEventId: number;
}

class SSEManager {
  private clients: Map<string, SSEClient> = new Map();
  private eventCounter = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventBuffer: Array<{
    id: number;
    environmentId: string;
    data: string;
    event: string;
    timestamp: number;
  }> = [];
  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly BUFFER_TTL_MS = 5 * 60 * 1000;

  constructor() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30_000);
  }

  addClient(environmentId: string, reply: FastifyReply): string {
    const clientId = crypto.randomUUID();
    const client: SSEClient = {
      id: clientId,
      environmentId,
      reply,
      connectedAt: new Date(),
      lastEventId: this.eventCounter,
    };

    this.clients.set(clientId, client);
    logger.info(
      { clientId, environmentId, totalClients: this.clients.size },
      "SSE client connected"
    );
    return clientId;
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      this.clients.delete(clientId);
      logger.info(
        {
          clientId,
          environmentId: client.environmentId,
          totalClients: this.clients.size,
        },
        "SSE client disconnected"
      );
    }
  }

  broadcast(event: {
    type: string;
    environmentId: string;
    flagKey: string;
    timestamp: string;
  }): void {
    this.eventCounter++;
    const eventId = this.eventCounter;
    const data = JSON.stringify(event);

    this.addToBuffer({
      id: eventId,
      environmentId: event.environmentId,
      data,
      event: event.type,
    });

    let sentCount = 0;
    for (const [clientId, client] of this.clients) {
      if (client.environmentId === event.environmentId) {
        try {
          this.sendEvent(client.reply, {
            id: String(eventId),
            event: event.type,
            data,
          });
          client.lastEventId = eventId;
          sentCount++;
        } catch (err) {
          logger.warn(
            { clientId, err },
            "Failed to send SSE event, removing client"
          );
          this.clients.delete(clientId);
        }
      }
    }

    logger.info(
      { eventId, environmentId: event.environmentId, sentCount },
      "SSE broadcast complete"
    );
  }

  replayMissedEvents(clientId: string, lastEventId: number): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const missed = this.eventBuffer.filter(
      (e) =>
        e.id > lastEventId && e.environmentId === client.environmentId
    );

    for (const event of missed) {
      this.sendEvent(client.reply, {
        id: String(event.id),
        event: event.event,
        data: event.data,
      });
    }
  }

  private sendEvent(
    reply: FastifyReply,
    event: { id: string; event: string; data: string }
  ): void {
    reply.raw.write(`id: ${event.id}\n`);
    reply.raw.write(`event: ${event.event}\n`);
    reply.raw.write(`data: ${event.data}\n\n`);
  }

  private sendHeartbeat(): void {
    for (const [clientId, client] of this.clients) {
      try {
        client.reply.raw.write(`:heartbeat ${Date.now()}\n\n`);
      } catch {
        this.clients.delete(clientId);
      }
    }
  }

  private addToBuffer(event: {
    id: number;
    environmentId: string;
    data: string;
    event: string;
  }): void {
    this.eventBuffer.push({ ...event, timestamp: Date.now() });
    const cutoff = Date.now() - this.BUFFER_TTL_MS;
    this.eventBuffer = this.eventBuffer.filter((e) => e.timestamp > cutoff);
    if (this.eventBuffer.length > this.MAX_BUFFER_SIZE) {
      this.eventBuffer = this.eventBuffer.slice(-this.MAX_BUFFER_SIZE);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getClientCountForEnvironment(environmentId: string): number {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.environmentId === environmentId) count++;
    }
    return count;
  }

  closeAll(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    for (const [, client] of this.clients) {
      try {
        client.reply.raw.end();
      } catch {
        // Already closed
      }
    }
    this.clients.clear();
  }
}

export const sseManager = new SSEManager();
```

### SSE Route Handler

```typescript
// apps/evaluation-api/src/routes/stream.ts
import { FastifyInstance, FastifyRequest } from "fastify";
import { sseManager } from "../services/sseManager";

export async function registerStreamRoutes(app: FastifyInstance) {
  app.get("/flags/stream", async (request: FastifyRequest, reply) => {
    const { environmentId } = request.apiKey;

    // Set SSE headers
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    });

    // Send initial connection event
    reply.raw.write(
      `event: connected\ndata: {"environmentId":"${environmentId}"}\n\n`
    );

    // Register client
    const clientId = sseManager.addClient(environmentId, reply);

    // Handle Last-Event-ID for reconnection
    const lastEventId = request.headers["last-event-id"];
    if (lastEventId) {
      const parsedId = parseInt(lastEventId as string, 10);
      if (!isNaN(parsedId)) {
        sseManager.replayMissedEvents(clientId, parsedId);
      }
    }

    // Clean up on disconnect
    request.raw.on("close", () => {
      sseManager.removeClient(clientId);
    });
  });
}
```

### Memory Management for Thousands of Connections

Each SSE connection holds an open `ServerResponse`. At 10,000 concurrent connections:

- **Memory:** Each connection is ~10-20 KB overhead. 10K connections = ~100-200 MB.
- **File descriptors:** Set `ulimit -n 65536` in your container.
- **Event loop:** For large fan-outs, batch the writes to avoid blocking:

```typescript
async broadcastBatched(
  environmentId: string,
  eventData: string
): Promise<void> {
  const clients = [...this.clients.values()].filter(
    (c) => c.environmentId === environmentId
  );
  const BATCH_SIZE = 500;

  for (let i = 0; i < clients.length; i += BATCH_SIZE) {
    const batch = clients.slice(i, i + BATCH_SIZE);
    for (const client of batch) {
      try {
        this.sendEvent(client.reply, { /* ... */ });
      } catch {
        this.clients.delete(client.id);
      }
    }
    // Yield to the event loop between batches
    await new Promise((resolve) => setImmediate(resolve));
  }
}
```

> **Coming from Laravel:** Laravel Broadcasting uses WebSockets (via Pusher or Laravel Websockets). SSE is simpler -- no bidirectional protocol, no WebSocket upgrade, works through standard HTTP proxies. PHP's process-per-request model makes long-lived connections impractical. Each PHP-FPM worker holding an SSE connection consumes an entire OS process. Node.js handles thousands of idle connections because they are just entries in the event loop, not dedicated processes.

---

## 7. Rate Limiting Strategy

### Sliding Window with Redis Lua Script

We use a **sliding window log** algorithm stored in Redis sorted sets, implemented as an atomic Lua script to prevent race conditions.

```typescript
// apps/evaluation-api/src/middleware/rateLimit.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { redis } from "../services/redisClient";
import { logger } from "../utils/logger";

const RATE_LIMITS: Record<string, number> = {
  starter: 1_000,
  pro: 10_000,
  enterprise: 100_000,
};

const WINDOW_SIZE_SECONDS = 60;

/**
 * Redis Lua script for atomic sliding window rate limiting.
 *
 * KEYS[1] = rate limit key
 * ARGV[1] = current timestamp (seconds)
 * ARGV[2] = window size (seconds)
 * ARGV[3] = max requests
 *
 * Returns: [current_count, is_allowed (0 or 1), ttl_until_reset]
 */
const RATE_LIMIT_LUA = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])

  -- Remove entries outside the window
  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

  -- Count current entries
  local count = redis.call('ZCARD', key)

  if count < limit then
    -- Add the current request
    redis.call('ZADD', key, now, now .. '-' .. math.random(1000000))
    redis.call('EXPIRE', key, window)
    return {count + 1, 1, window}
  else
    -- Get the oldest entry to calculate reset time
    local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
    local reset = 0
    if #oldest > 0 then
      reset = tonumber(oldest[2]) + window - now
    end
    return {count, 0, reset}
  end
`;

async function rateLimitHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (request.url === "/v1/health") return;
  if (!request.apiKey) return;

  const { id: apiKeyId, planTier } = request.apiKey;
  const limit = RATE_LIMITS[planTier] ?? RATE_LIMITS.starter;
  const key = `flagline:ratelimit:${apiKeyId}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const result = (await redis.eval(
      RATE_LIMIT_LUA,
      1,
      key,
      now,
      WINDOW_SIZE_SECONDS,
      limit
    )) as [number, number, number];

    const [currentCount, isAllowed, ttlUntilReset] = result;

    reply.header("X-RateLimit-Limit", limit);
    reply.header(
      "X-RateLimit-Remaining",
      Math.max(0, limit - currentCount)
    );
    reply.header(
      "X-RateLimit-Reset",
      Math.ceil(Date.now() / 1000) + ttlUntilReset
    );

    if (isAllowed === 0) {
      reply.header("Retry-After", ttlUntilReset);
      return reply.status(429).send({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Rate limit exceeded. Limit: ${limit} requests per ${WINDOW_SIZE_SECONDS}s. Retry after ${ttlUntilReset}s.`,
        },
      });
    }
  } catch (err) {
    // Fail open: if Redis is down, allow the request
    logger.warn(
      { err },
      "Rate limit check failed, allowing request (fail-open)"
    );
  }
}

export const rateLimitPlugin = fp(async (app: FastifyInstance) => {
  app.addHook("onRequest", rateLimitHandler);
});
```

### DDoS Protection Considerations

Rate limiting at the application layer is insufficient for DDoS protection. Layer this:

1. **CDN/Edge (Cloudflare, AWS Shield):** Absorbs volumetric attacks before they reach your origin.
2. **Load balancer rate limiting (ALB/nginx):** Per-IP connection limits and request rate limits.
3. **Application rate limiting (the code above):** Per-API-key limits for fair usage and plan enforcement.

> **Coming from Laravel:** Laravel has `ThrottleRequests` middleware (`throttle:60,1`). The concept is identical. The difference is Laravel typically uses a simple fixed-window counter. Our implementation uses a sorted set for a true sliding window, avoiding the burst-at-boundary problem. The Lua script ensures atomicity -- without it, you have a TOCTOU race condition.

---

## 8. Error Handling, Logging, Health Checks

### Custom Error Classes

```typescript
// apps/evaluation-api/src/utils/errors.ts

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      404,
      "NOT_FOUND",
      `${resource}${id ? ` (${id})` : ""} not found`
    );
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "AUTHENTICATION_ERROR", message);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super(
      429,
      "RATE_LIMIT_EXCEEDED",
      `Rate limit exceeded. Retry after ${retryAfter}s`
    );
    this.name = "RateLimitError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied") {
    super(403, "FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}
```

### Global Error Handler

```typescript
// Add to buildApp() in app.ts

app.setErrorHandler((error, request, reply) => {
  // Custom errors
  if (error instanceof AppError) {
    request.log.warn(
      { err: error, code: error.code, statusCode: error.statusCode },
      error.message
    );
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  // Fastify validation errors (JSON Schema)
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.validation,
      },
    });
  }

  // Prisma errors
  if (error.constructor.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any;
    if (prismaError.code === "P2025") {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource not found" },
      });
    }
    if (prismaError.code === "P2002") {
      return reply.status(409).send({
        success: false,
        error: {
          code: "CONFLICT",
          message: "A resource with that identifier already exists",
          details: { target: prismaError.meta?.target },
        },
      });
    }
  }

  // Unhandled errors
  request.log.error({ err: error }, "Unhandled error");
  return reply.status(500).send({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
});
```

> **Coming from Laravel:** This is like `app/Exceptions/Handler.php`. The `render` method maps exception types to HTTP responses -- we do the same with `instanceof` checks. One key difference: in Node.js, an unhandled error in an async context can crash the process. Always let errors propagate to this global handler rather than swallowing them.

### Structured Logging with Pino

```typescript
// apps/evaluation-api/src/utils/logger.ts
import pino from "pino";
import { config } from "../config";

export const logger = pino({
  level: config.LOG_LEVEL ?? "info",
  ...(config.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
  base: {
    service: "evaluation-api",
    version: config.APP_VERSION,
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
```

Production JSON output:

```json
{"level":30,"time":1718451000000,"service":"evaluation-api","version":"1.3.0","reqId":"550e8400-e29b-41d4-a716-446655440000","req":{"method":"POST","url":"/v1/evaluate"},"msg":"request completed","responseTime":2.4,"statusCode":200}
```

> **Coming from Laravel:** This replaces `Log::info()` / Monolog. Pino is asynchronous -- log calls do not block the event loop. Always log JSON in production; structured logging is not optional.

### Health Check Endpoint

```typescript
// apps/evaluation-api/src/routes/health.ts
import { FastifyInstance } from "fastify";
import { prisma } from "../services/prismaClient";
import { redis } from "../services/redisClient";
import { sseManager } from "../services/sseManager";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    const checks: Record<string, unknown> = {};
    let overallHealthy = true;

    // Check PostgreSQL
    try {
      const dbStart = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: "up",
        latencyMs: Math.round(performance.now() - dbStart),
      };
    } catch (err) {
      checks.database = {
        status: "down",
        error: (err as Error).message,
      };
      overallHealthy = false;
    }

    // Check Redis
    try {
      const redisStart = performance.now();
      await redis.ping();
      checks.redis = {
        status: "up",
        latencyMs: Math.round(performance.now() - redisStart),
      };
    } catch (err) {
      checks.redis = {
        status: "down",
        error: (err as Error).message,
      };
      overallHealthy = false;
    }

    // Memory usage
    const mem = process.memoryUsage();
    checks.memory = {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    };

    checks.sseClients = sseManager.getClientCount();

    const statusCode = overallHealthy ? 200 : 503;
    return reply.status(statusCode).send({
      success: overallHealthy,
      data: {
        status: overallHealthy ? "healthy" : "degraded",
        uptime: Math.floor(process.uptime()),
        checks,
        version: process.env.APP_VERSION ?? "unknown",
      },
    });
  });
}
```

---

## 9. Database Access Layer with Prisma

### Prisma Schema (Relevant Excerpt)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id        String   @id @default(cuid())
  name      String
  planTier  String   @default("starter")
  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id           String        @id @default(cuid())
  tenantId     String
  tenant       Tenant        @relation(fields: [tenantId], references: [id])
  name         String
  environments Environment[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([tenantId])
}

model Environment {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  name      String
  type      String
  flags     Flag[]
  apiKeys   ApiKey[]
  createdAt DateTime @default(now())

  @@unique([projectId, name])
  @@index([projectId])
}

model Flag {
  id                  String      @id @default(cuid())
  environmentId       String
  environment         Environment @relation(fields: [environmentId], references: [id])
  key                 String
  name                String
  description         String?
  enabled             Boolean     @default(false)
  variations          Variation[]
  rules               Rule[]
  defaultVariationKey String
  offVariationKey     String
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  @@unique([environmentId, key])
  @@index([environmentId])
}

model Variation {
  id     String @id @default(cuid())
  flagId String
  flag   Flag   @relation(fields: [flagId], references: [id], onDelete: Cascade)
  key    String
  value  Json

  @@unique([flagId, key])
}

model Rule {
  id           String          @id @default(cuid())
  flagId       String
  flag         Flag            @relation(fields: [flagId], references: [id], onDelete: Cascade)
  priority     Int
  variationKey String
  percentage   Int?
  enabled      Boolean         @default(true)
  conditions   RuleCondition[]

  @@index([flagId, priority])
}

model RuleCondition {
  id        String @id @default(cuid())
  ruleId    String
  rule      Rule   @relation(fields: [ruleId], references: [id], onDelete: Cascade)
  attribute String
  operator  String
  value     Json

  @@index([ruleId])
}

model ApiKey {
  id            String      @id @default(cuid())
  environmentId String
  environment   Environment @relation(fields: [environmentId], references: [id])
  projectId     String
  keyHash       String      @unique
  keyPrefix     String
  name          String?
  revokedAt     DateTime?
  createdAt     DateTime    @default(now())

  @@index([environmentId])
  @@index([keyHash])
}

model AuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String?
  action     String
  resource   String
  resourceId String
  before     Json?
  after      Json?
  createdAt  DateTime @default(now())

  @@index([tenantId, createdAt])
  @@index([resourceId])
}
```

### Prisma Client Singleton

```typescript
// apps/evaluation-api/src/services/prismaClient.ts
import { PrismaClient } from "@prisma/client";
import { config } from "../config";
import { logger } from "../utils/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      config.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ]
        : [
            { emit: "stdout", level: "warn" },
            { emit: "stdout", level: "error" },
          ],
  });

if (config.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Log slow queries in development
if (config.NODE_ENV === "development") {
  (prisma.$on as any)("query", (e: any) => {
    if (e.duration > 100) {
      logger.warn(
        { duration: e.duration, query: e.query },
        "Slow query detected"
      );
    }
  });
}
```

> **Coming from Laravel:** Key mental model shifts from Eloquent to Prisma:
>
> - **No active record.** Prisma uses the repository pattern. You call `prisma.flag.findMany()` -- there is no `Flag::where(...)` on a model instance.
> - **No $fillable/$guarded.** Prisma's `create` / `update` accept an explicit `data` object. No mass-assignment vulnerability.
> - **Relations are explicit.** You must include `include: { rules: true }` to load relations. No lazy loading (by design -- prevents N+1 queries).
> - **Migrations.** `npx prisma migrate dev` is like `php artisan migrate`. `npx prisma db push` is for prototyping.

### Service Layer Pattern

```typescript
// apps/evaluation-api/src/services/FlagService.ts
import { prisma } from "./prismaClient";
import { Prisma } from "@prisma/client";

export class FlagService {
  static async getFlagsWithRules(environmentId: string) {
    return prisma.flag.findMany({
      where: { environmentId },
      include: {
        variations: true,
        rules: {
          where: { enabled: true },
          include: { conditions: true },
          orderBy: { priority: "asc" },
        },
      },
    });
  }

  static async createFlagWithRules(input: {
    environmentId: string;
    key: string;
    name: string;
    description?: string;
    variations: Array<{ key: string; value: Prisma.JsonValue }>;
    defaultVariationKey: string;
    offVariationKey: string;
    rules?: Array<{
      priority: number;
      variationKey: string;
      percentage?: number;
      conditions: Array<{
        attribute: string;
        operator: string;
        value: Prisma.JsonValue;
      }>;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const flag = await tx.flag.create({
        data: {
          environmentId: input.environmentId,
          key: input.key,
          name: input.name,
          description: input.description,
          defaultVariationKey: input.defaultVariationKey,
          offVariationKey: input.offVariationKey,
          enabled: false,
          variations: { create: input.variations },
          rules: input.rules
            ? {
                create: input.rules.map((rule) => ({
                  priority: rule.priority,
                  variationKey: rule.variationKey,
                  percentage: rule.percentage,
                  conditions: { create: rule.conditions },
                })),
              }
            : undefined,
        },
        include: {
          variations: true,
          rules: { include: { conditions: true } },
        },
      });
      return flag;
    });
  }
}
```

### Audit Log Service

```typescript
// apps/evaluation-api/src/services/AuditLogService.ts
import { prisma } from "./prismaClient";
import { Prisma } from "@prisma/client";

export class AuditLogService {
  static async log(entry: {
    tenantId: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId: string;
    before?: unknown;
    after?: unknown;
  }) {
    await prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        before: entry.before as Prisma.JsonValue,
        after: entry.after as Prisma.JsonValue,
      },
    });
  }
}
```

### Connection Pooling and Read Replicas

```
# .env (via PgBouncer for production)
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/flagline?pgbouncer=true&connection_limit=10"
```

For the evaluation API, route reads to a replica:

```typescript
import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";

export const prisma = new PrismaClient().$extends(
  readReplicas({ url: process.env.DATABASE_REPLICA_URL! })
);
// All reads go to replica, writes go to primary.
// The evaluation API only reads -- 100% of queries hit the replica.
```

### Handling Prisma Errors

```typescript
import { Prisma } from "@prisma/client";
import { AppError, NotFoundError } from "../utils/errors";

try {
  await prisma.flag.create({ data: { /* ... */ } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        throw new AppError(
          409,
          "CONFLICT",
          "A flag with that key already exists in this environment"
        );
      case "P2025":
        throw new NotFoundError("Flag");
      case "P2003":
        throw new AppError(
          400,
          "INVALID_REFERENCE",
          "Referenced resource does not exist"
        );
      default:
        throw error;
    }
  }
  throw error;
}
```

> **Coming from Laravel:** Configuring read/write connections is like `'read'` and `'write'` in `config/database.php`. Prisma's extension handles it automatically -- no need to manually call `DB::connection('read')`.

### Evaluate Route Handler

For completeness, here is the route handler tying auth, flag store, and evaluation engine together:

```typescript
// apps/evaluation-api/src/routes/evaluate.ts
import { FastifyInstance } from "fastify";
import { Type, Static } from "@sinclair/typebox";
import { evaluateFlag } from "../services/evaluationEngine";
import { getFlagsForEnvironment, getFlag } from "../services/flagStore";
import { success } from "../utils/envelope";

const EvaluateBody = Type.Object({
  flagKey: Type.String({ minLength: 1 }),
  context: Type.Record(Type.String(), Type.Any()),
});

const BatchEvaluateBody = Type.Object({
  context: Type.Record(Type.String(), Type.Any()),
});

type EvaluateBodyType = Static<typeof EvaluateBody>;
type BatchEvaluateBodyType = Static<typeof BatchEvaluateBody>;

export async function registerEvaluateRoutes(app: FastifyInstance) {
  app.post<{ Body: EvaluateBodyType }>(
    "/evaluate",
    { schema: { body: EvaluateBody } },
    async (request, reply) => {
      const { flagKey, context } = request.body;
      const { environmentId } = request.apiKey;

      const flag = await getFlag(environmentId, flagKey);
      const result = evaluateFlag(flag ?? null, flagKey, context);

      return success(reply, result);
    }
  );

  app.post<{ Body: BatchEvaluateBodyType }>(
    "/evaluate/batch",
    { schema: { body: BatchEvaluateBody } },
    async (request, reply) => {
      const { context } = request.body;
      const { environmentId } = request.apiKey;

      const flags = await getFlagsForEnvironment(environmentId);

      const results: Record<string, any> = {};
      for (const flag of flags) {
        const result = evaluateFlag(flag, flag.key, context);
        results[flag.key] = {
          value: result.value,
          variationKey: result.variationKey,
          reason: result.reason,
        };
      }

      return success(reply, {
        flags: results,
        environment: request.apiKey.environment,
        evaluatedAt: new Date().toISOString(),
      });
    }
  );
}
```

---

## 10. Testing

### Testing Stack

```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "supertest": "^6.3.0",
    "@faker-js/faker": "^8.4.0",
    "vitest-mock-extended": "^1.3.0"
  }
}
```

We use **Vitest** (not Jest). It is faster, has native TypeScript support, and is ESM-friendly.

### Test Factories

```typescript
// apps/evaluation-api/tests/helpers/factories.ts
import { faker } from "@faker-js/faker";
import { FlagConfig, FlagRule, RuleCondition } from "../../src/types/flag";

export function buildFlagConfig(
  overrides: Partial<FlagConfig> = {}
): FlagConfig {
  return {
    key: faker.helpers.slugify(faker.lorem.words(3)),
    enabled: true,
    variations: [
      { key: "on", value: true },
      { key: "off", value: false },
    ],
    rules: [],
    defaultVariation: "off",
    offVariation: "off",
    ...overrides,
  };
}

export function buildRule(overrides: Partial<FlagRule> = {}): FlagRule {
  return {
    id: faker.string.uuid(),
    priority: 1,
    conditions: [],
    variationKey: "on",
    enabled: true,
    ...overrides,
  };
}

export function buildCondition(
  overrides: Partial<RuleCondition> = {}
): RuleCondition {
  return {
    attribute: "country",
    operator: "equals",
    value: "US",
    ...overrides,
  };
}

export function buildFlagWithPercentageRollout(
  percentage: number
): FlagConfig {
  return buildFlagConfig({
    rules: [buildRule({ percentage, conditions: [] })],
  });
}

export function buildFlagWithTargeting(
  attribute: string,
  operator: string,
  value: unknown
): FlagConfig {
  return buildFlagConfig({
    rules: [
      buildRule({
        conditions: [
          buildCondition({
            attribute,
            operator: operator as any,
            value: value as any,
          }),
        ],
      }),
    ],
  });
}
```

> **Coming from Laravel:** These factories serve the same purpose as `Flag::factory()->create()`. The difference is they are plain functions returning plain objects -- no database interaction. For integration tests needing DB records, call `prisma.flag.create({ data: buildFlagConfig() })` explicitly.

### Unit Tests for the Evaluation Engine

```typescript
// apps/evaluation-api/tests/unit/evaluationEngine.test.ts
import { describe, it, expect } from "vitest";
import { evaluateFlag } from "../../src/services/evaluationEngine";
import { FlagConfig } from "../../src/types/flag";
import { EvaluationContext } from "../../src/types/api";

function createFlag(overrides: Partial<FlagConfig> = {}): FlagConfig {
  return {
    key: "test-flag",
    enabled: true,
    variations: [
      { key: "enabled", value: true },
      { key: "disabled", value: false },
    ],
    rules: [],
    defaultVariation: "disabled",
    offVariation: "disabled",
    ...overrides,
  };
}

function createContext(
  overrides: Partial<EvaluationContext> = {}
): EvaluationContext {
  return {
    userId: "user_123",
    email: "alice@example.com",
    country: "US",
    plan: "pro",
    ...overrides,
  };
}

describe("evaluateFlag", () => {
  describe("when flag is null", () => {
    it("returns FLAG_NOT_FOUND", () => {
      const result = evaluateFlag(null, "missing-flag", createContext());
      expect(result.reason).toBe("FLAG_NOT_FOUND");
      expect(result.value).toBe(false);
    });
  });

  describe("when flag is disabled", () => {
    it("returns FLAG_DISABLED with off-variation", () => {
      const flag = createFlag({ enabled: false });
      const result = evaluateFlag(flag, "test-flag", createContext());
      expect(result.reason).toBe("FLAG_DISABLED");
      expect(result.value).toBe(false);
      expect(result.variationKey).toBe("disabled");
    });
  });

  describe("when flag is enabled with no rules", () => {
    it("returns DEFAULT_VALUE", () => {
      const flag = createFlag({ enabled: true });
      const result = evaluateFlag(flag, "test-flag", createContext());
      expect(result.reason).toBe("DEFAULT_VALUE");
      expect(result.variationKey).toBe("disabled");
    });
  });

  describe("rule targeting", () => {
    it("matches equals condition", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_1",
            priority: 1,
            enabled: true,
            conditions: [
              { attribute: "country", operator: "equals", value: "US" },
            ],
            variationKey: "enabled",
          },
        ],
      });
      const result = evaluateFlag(
        flag,
        "test-flag",
        createContext({ country: "US" })
      );
      expect(result.reason).toBe("RULE_MATCH");
      expect(result.value).toBe(true);
      expect(result.ruleId).toBe("rule_1");
    });

    it("does not match when condition fails", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_1",
            priority: 1,
            enabled: true,
            conditions: [
              { attribute: "country", operator: "equals", value: "US" },
            ],
            variationKey: "enabled",
          },
        ],
      });
      const result = evaluateFlag(
        flag,
        "test-flag",
        createContext({ country: "DE" })
      );
      expect(result.reason).toBe("DEFAULT_VALUE");
    });

    it("requires ALL conditions to match (AND logic)", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_1",
            priority: 1,
            enabled: true,
            conditions: [
              { attribute: "country", operator: "equals", value: "US" },
              { attribute: "plan", operator: "equals", value: "pro" },
            ],
            variationKey: "enabled",
          },
        ],
      });

      const result1 = evaluateFlag(
        flag,
        "test-flag",
        createContext({ country: "US", plan: "pro" })
      );
      expect(result1.reason).toBe("RULE_MATCH");

      const result2 = evaluateFlag(
        flag,
        "test-flag",
        createContext({ country: "US", plan: "starter" })
      );
      expect(result2.reason).toBe("DEFAULT_VALUE");
    });

    it("evaluates rules in priority order, first match wins", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_high",
            priority: 1,
            enabled: true,
            conditions: [
              {
                attribute: "plan",
                operator: "equals",
                value: "enterprise",
              },
            ],
            variationKey: "enabled",
          },
          {
            id: "rule_low",
            priority: 2,
            enabled: true,
            conditions: [
              { attribute: "country", operator: "equals", value: "US" },
            ],
            variationKey: "enabled",
          },
        ],
      });

      const result = evaluateFlag(
        flag,
        "test-flag",
        createContext({ plan: "enterprise", country: "US" })
      );
      expect(result.ruleId).toBe("rule_high");
    });

    it("skips disabled rules", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_disabled",
            priority: 1,
            enabled: false,
            conditions: [
              { attribute: "country", operator: "equals", value: "US" },
            ],
            variationKey: "enabled",
          },
        ],
      });
      const result = evaluateFlag(
        flag,
        "test-flag",
        createContext({ country: "US" })
      );
      expect(result.reason).toBe("DEFAULT_VALUE");
    });
  });

  describe("condition operators", () => {
    const testOperator = (
      operator: string,
      attribute: string,
      ruleValue: unknown,
      contextValue: unknown,
      shouldMatch: boolean
    ) => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_op",
            priority: 1,
            enabled: true,
            conditions: [
              {
                attribute,
                operator: operator as any,
                value: ruleValue as any,
              },
            ],
            variationKey: "enabled",
          },
        ],
      });
      const result = evaluateFlag(flag, "test-flag", {
        [attribute]: contextValue,
      } as any);
      if (shouldMatch) {
        expect(result.reason).toBe("RULE_MATCH");
      } else {
        expect(result.reason).toBe("DEFAULT_VALUE");
      }
    };

    it("in: matches when value is in array", () => {
      testOperator("in", "country", ["US", "CA", "UK"], "CA", true);
    });

    it("in: fails when value not in array", () => {
      testOperator("in", "country", ["US", "CA", "UK"], "DE", false);
    });

    it("contains: matches substring", () => {
      testOperator("contains", "email", "acme.com", "alice@acme.com", true);
    });

    it("gt: numeric greater than", () => {
      testOperator("gt", "age", 18, 21, true);
      testOperator("gt", "age", 18, 16, false);
    });

    it("regex: matches pattern", () => {
      testOperator(
        "regex",
        "email",
        "^.*@acme\\.com$",
        "alice@acme.com",
        true
      );
      testOperator(
        "regex",
        "email",
        "^.*@acme\\.com$",
        "alice@other.com",
        false
      );
    });

    it("exists: true when attribute is present", () => {
      testOperator("exists", "email", true, "alice@example.com", true);
    });

    it("not_exists: true when attribute is missing", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_op",
            priority: 1,
            enabled: true,
            conditions: [
              {
                attribute: "beta_opt_in",
                operator: "not_exists",
                value: true,
              },
            ],
            variationKey: "enabled",
          },
        ],
      });
      const result = evaluateFlag(flag, "test-flag", { userId: "user_1" });
      expect(result.reason).toBe("RULE_MATCH");
    });
  });

  describe("percentage rollout", () => {
    it("is deterministic for the same user", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_pct",
            priority: 1,
            enabled: true,
            conditions: [],
            variationKey: "enabled",
            percentage: 50,
          },
        ],
      });

      const r1 = evaluateFlag(
        flag,
        "test-flag",
        createContext({ userId: "user_abc" })
      );
      const r2 = evaluateFlag(
        flag,
        "test-flag",
        createContext({ userId: "user_abc" })
      );

      expect(r1.value).toBe(r2.value);
      expect(r1.reason).toBe(r2.reason);
    });

    it("distributes roughly 50/50 over many users", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_pct",
            priority: 1,
            enabled: true,
            conditions: [],
            variationKey: "enabled",
            percentage: 50,
          },
        ],
      });

      let enabled = 0;
      const total = 10_000;
      for (let i = 0; i < total; i++) {
        const result = evaluateFlag(flag, "test-flag", {
          userId: `user_${i}`,
        });
        if (result.value === true) enabled++;
      }

      const ratio = enabled / total;
      expect(ratio).toBeGreaterThan(0.45);
      expect(ratio).toBeLessThan(0.55);
    });

    it("skips percentage rule when userId is missing", () => {
      const flag = createFlag({
        rules: [
          {
            id: "rule_pct",
            priority: 1,
            enabled: true,
            conditions: [],
            variationKey: "enabled",
            percentage: 50,
          },
        ],
      });
      const result = evaluateFlag(flag, "test-flag", {});
      expect(result.reason).toBe("DEFAULT_VALUE");
    });
  });
});
```

### MurmurHash Unit Tests

```typescript
// apps/evaluation-api/tests/unit/murmurhash.test.ts
import { describe, it, expect } from "vitest";
import { murmurhash3, getBucket } from "../../src/utils/murmurhash";

describe("murmurhash3", () => {
  it("returns consistent results for the same input", () => {
    expect(murmurhash3("hello")).toBe(murmurhash3("hello"));
  });

  it("returns different results for different inputs", () => {
    expect(murmurhash3("hello")).not.toBe(murmurhash3("world"));
  });

  it("returns a 32-bit unsigned integer", () => {
    const hash = murmurhash3("test");
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("getBucket", () => {
  it("returns a value between 0 and 99", () => {
    for (let i = 0; i < 1000; i++) {
      const bucket = getBucket("flag", `user_${i}`);
      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThan(100);
    }
  });

  it("distributes evenly across 100 buckets", () => {
    const buckets = new Array(100).fill(0);
    const total = 100_000;
    for (let i = 0; i < total; i++) {
      const bucket = getBucket("test-flag", `user_${i}`);
      buckets[bucket]++;
    }
    for (const count of buckets) {
      expect(count).toBeGreaterThan(700);
      expect(count).toBeLessThan(1300);
    }
  });
});
```

### Integration Tests for API Endpoints

```typescript
// apps/evaluation-api/tests/integration/evaluate.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/services/prismaClient";
import { redis } from "../../src/services/redisClient";
import { FastifyInstance } from "fastify";

let app: FastifyInstance;
let request: supertest.SuperTest<supertest.Test>;

const TEST_API_KEY = "fl_test_aaaabbbbccccddddeeeeffffgggghhhh";
const TEST_API_KEY_HASH =
  "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d";

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  request = supertest(app.server);
});

afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
  redis.disconnect();
});

beforeEach(async () => {
  // Clean and re-seed
  await prisma.ruleCondition.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.variation.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tenant.deleteMany();
  await redis.flushdb();

  // Seed test data
  const tenant = await prisma.tenant.create({
    data: { name: "Test Tenant", planTier: "pro" },
  });
  const project = await prisma.project.create({
    data: { tenantId: tenant.id, name: "Test Project" },
  });
  const env = await prisma.environment.create({
    data: { projectId: project.id, name: "test", type: "test" },
  });
  await prisma.apiKey.create({
    data: {
      environmentId: env.id,
      projectId: project.id,
      keyHash: TEST_API_KEY_HASH,
      keyPrefix: "fl_test_aaaa",
      name: "Test Key",
    },
  });
  await prisma.flag.create({
    data: {
      environmentId: env.id,
      key: "test-flag",
      name: "Test Flag",
      enabled: true,
      defaultVariationKey: "disabled",
      offVariationKey: "disabled",
      variations: {
        create: [
          { key: "enabled", value: true },
          { key: "disabled", value: false },
        ],
      },
      rules: {
        create: [
          {
            priority: 1,
            variationKey: "enabled",
            conditions: {
              create: [
                {
                  attribute: "country",
                  operator: "equals",
                  value: "US",
                },
              ],
            },
          },
        ],
      },
    },
  });
});

describe("POST /v1/evaluate", () => {
  it("returns 401 without API key", async () => {
    const res = await request
      .post("/v1/evaluate")
      .send({ flagKey: "test-flag", context: {} });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("MISSING_API_KEY");
  });

  it("evaluates a flag with matching rule", async () => {
    const res = await request
      .post("/v1/evaluate")
      .set("Authorization", `Bearer ${TEST_API_KEY}`)
      .send({
        flagKey: "test-flag",
        context: { userId: "user_1", country: "US" },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.value).toBe(true);
    expect(res.body.data.reason).toBe("RULE_MATCH");
  });

  it("returns default when no rule matches", async () => {
    const res = await request
      .post("/v1/evaluate")
      .set("Authorization", `Bearer ${TEST_API_KEY}`)
      .send({
        flagKey: "test-flag",
        context: { userId: "user_1", country: "DE" },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.value).toBe(false);
    expect(res.body.data.reason).toBe("DEFAULT_VALUE");
  });

  it("returns FLAG_NOT_FOUND for unknown flag", async () => {
    const res = await request
      .post("/v1/evaluate")
      .set("Authorization", `Bearer ${TEST_API_KEY}`)
      .send({
        flagKey: "nonexistent-flag",
        context: { userId: "user_1" },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.reason).toBe("FLAG_NOT_FOUND");
  });
});

describe("POST /v1/evaluate/batch", () => {
  it("evaluates all flags for the environment", async () => {
    const res = await request
      .post("/v1/evaluate/batch")
      .set("Authorization", `Bearer ${TEST_API_KEY}`)
      .send({ context: { userId: "user_1", country: "US" } });

    expect(res.status).toBe(200);
    expect(res.body.data.flags).toHaveProperty("test-flag");
    expect(res.body.data.flags["test-flag"].value).toBe(true);
  });
});
```

### Testing SSE Endpoints

```typescript
// apps/evaluation-api/tests/integration/stream.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "../../src/app";
import { FastifyInstance } from "fastify";
import http from "node:http";

let app: FastifyInstance;
let baseUrl: string;

beforeAll(async () => {
  app = await buildApp();
  await app.listen({ port: 0 });
  const address = app.server.address();
  if (typeof address === "object" && address) {
    baseUrl = `http://127.0.0.1:${address.port}`;
  }
});

afterAll(async () => {
  await app.close();
});

function connectSSE(
  url: string,
  apiKey: string
): Promise<{
  events: Array<{ event: string; data: string }>;
  close: () => void;
}> {
  return new Promise((resolve, reject) => {
    const events: Array<{ event: string; data: string }> = [];

    const req = http.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "text/event-stream",
        },
      },
      (res) => {
        let buffer = "";
        res.on("data", (chunk: Buffer) => {
          buffer += chunk.toString();
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const lines = part.split("\n");
            let event = "message";
            let data = "";
            for (const line of lines) {
              if (line.startsWith("event: ")) event = line.slice(7);
              if (line.startsWith("data: ")) data = line.slice(6);
            }
            if (data) events.push({ event, data });
          }
        });
        resolve({ events, close: () => req.destroy() });
      }
    );
    req.on("error", reject);
  });
}

describe("GET /v1/flags/stream", () => {
  it("connects and receives the connected event", async () => {
    const { events, close } = await connectSSE(
      `${baseUrl}/v1/flags/stream`,
      "fl_test_aaaabbbbccccddddeeeeffffgggghhhh"
    );

    await new Promise((r) => setTimeout(r, 200));

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].event).toBe("connected");

    close();
  });
});
```

### Mocking Redis

```typescript
// apps/evaluation-api/tests/helpers/mocks.ts
import { vi } from "vitest";

vi.mock("../../src/services/redisClient", () => {
  const RedisMock = {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue("PONG"),
    eval: vi.fn().mockResolvedValue([1, 1, 60]),
    disconnect: vi.fn(),
    subscribe: vi.fn().mockResolvedValue(1),
    on: vi.fn(),
  };
  return { redis: RedisMock, redisSub: RedisMock };
});
```

### Mocking Prisma

```typescript
// apps/evaluation-api/tests/helpers/prismaMock.ts
import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";

export const prismaMock = mockDeep<PrismaClient>();

vi.mock("../../src/services/prismaClient", () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  mockReset(prismaMock);
});

// Usage in a test file:
// prismaMock.flag.findMany.mockResolvedValue([...test flags...]);
```

> **Coming from Laravel:** The testing pyramid is the same: unit tests for service classes, feature tests with `RefreshDatabase` for HTTP endpoints, and rare browser tests with Dusk. `$this->postJson('/api/evaluate', $payload)` in Laravel is equivalent to `supertest(app.server).post('/v1/evaluate').send(payload)`. Fastify's `inject()` also works as an alternative to supertest without actual network calls.

---

## Quick Reference: Laravel to Node.js/Fastify Mapping

| Laravel Concept | Flagline Equivalent |
|---|---|
| `routes/api.php` | `src/routes/*.ts` registered with `app.register()` |
| `app/Http/Middleware/` | `src/middleware/*.ts` as Fastify plugins with `addHook` |
| `app/Http/Requests/` (Form Requests) | TypeBox/Zod schemas on route `schema` option |
| `app/Models/Flag.php` (Eloquent) | `prisma.flag.*` calls (Prisma Client) |
| `app/Services/` | `src/services/*.ts` -- same concept |
| `$request->bearerToken()` | `request.headers.authorization?.slice(7)` |
| `Cache::remember()` | Redis `get` + `setex` in `flagStore.ts` |
| `php artisan serve` | `npx tsx src/index.ts` or `node dist/index.js` |
| `php artisan migrate` | `npx prisma migrate dev` |
| `php artisan tinker` | `npx prisma studio` (GUI) or Node.js REPL |
| `Log::info()` (Monolog) | `logger.info()` (pino) |
| `phpunit` / `pest` | `vitest run` |
| Laravel Broadcasting (Redis) | Redis pub/sub + SSE |
| `config/database.php` read/write | Prisma `@prisma/extension-read-replicas` |
| `.env` + `config()` | `config.ts` with Zod validation at startup |
| `php artisan queue:work` | Not needed -- pub/sub is in-process |
| Supervisor / process manager | Docker + container orchestration |
| `$fillable` / `$guarded` | Not needed -- Prisma `data` is explicit |
| `RefreshDatabase` trait | `beforeEach` with `prisma.*.deleteMany()` |
| `Flag::factory()->create()` | `buildFlagConfig()` helper + `prisma.flag.create()` |

---

*This document covers the evaluation API service architecture for Flagline. For dashboard API patterns (Next.js Route Handlers, Server Actions), see 05-nextjs-patterns.md.*
