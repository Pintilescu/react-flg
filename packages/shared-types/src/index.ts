// Flag value types
export type FlagValue = boolean | string | number | Record<string, unknown>;

export type FlagType = 'BOOLEAN' | 'STRING' | 'NUMBER' | 'JSON';

export interface FlagConfig {
  key: string;
  type: FlagType;
  enabled: boolean;
  defaultValue: FlagValue;
  rules: TargetingRule[];
  rolloutPercentage: number;
}

// Targeting rules
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'regex'
  | 'semver_gt'
  | 'semver_lt'
  | 'semver_eq';

export interface RuleCondition {
  attribute: string;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

export interface TargetingRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: RuleCondition[];
  conditionLogic: 'AND' | 'OR';
  value: FlagValue;
  rolloutPercentage: number;
}

// Evaluation
export interface EvaluationContext {
  userId?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface EvaluationResult {
  key: string;
  value: FlagValue;
  reason: 'RULE_MATCH' | 'ROLLOUT' | 'DEFAULT' | 'DISABLED' | 'NOT_FOUND' | 'ERROR';
  ruleId?: string;
}

export interface BatchEvaluationRequest {
  context: EvaluationContext;
  flags?: string[];
}

export interface BatchEvaluationResponse {
  flags: Record<string, EvaluationResult>;
  context: EvaluationContext;
}

// API responses
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// SSE events
export type SSEEvent =
  | { type: 'flag_updated'; data: { key: string; config: FlagConfig } }
  | { type: 'flag_deleted'; data: { key: string } }
  | { type: 'flags_reloaded'; data: { flags: Record<string, FlagConfig> } }
  | { type: 'heartbeat'; data: Record<string, never> };

// Plans & billing
export type PlanTier = 'FREE' | 'STARTER' | 'PRO';

export interface PlanLimits {
  maxFlags: number;
  maxProjects: number;
  maxEvaluationsPerDay: number;
  maxTeamMembers: number;
  auditLog: boolean;
  sso: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: {
    maxFlags: 3,
    maxProjects: 1,
    maxEvaluationsPerDay: 1_000,
    maxTeamMembers: 1,
    auditLog: false,
    sso: false,
  },
  STARTER: {
    maxFlags: 25,
    maxProjects: 5,
    maxEvaluationsPerDay: 100_000,
    maxTeamMembers: 2,
    auditLog: false,
    sso: false,
  },
  PRO: {
    maxFlags: -1,
    maxProjects: -1,
    maxEvaluationsPerDay: 1_000_000,
    maxTeamMembers: 10,
    auditLog: true,
    sso: true,
  },
};

// Audit log
export type AuditAction =
  | 'flag.created'
  | 'flag.updated'
  | 'flag.deleted'
  | 'flag.toggled'
  | 'rule.created'
  | 'rule.updated'
  | 'rule.deleted'
  | 'environment.created'
  | 'project.created'
  | 'apikey.created'
  | 'apikey.revoked'
  | 'member.invited'
  | 'member.removed';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  userId: string;
  timestamp: string;
}
