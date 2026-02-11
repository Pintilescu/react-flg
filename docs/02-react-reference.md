# Crivline — React Reference

> **Audience**: Backend developers with 5+ years of PHP/Laravel experience transitioning to
> React, Next.js (App Router), TypeScript, and the broader frontend ecosystem.
>
> This is a practical implementation reference. Every example is written in the context of
> Crivline, our feature-flag SaaS dashboard. If you have built admin panels in Laravel Nova
> or Filament, the concepts will feel familiar — the execution is different.

---

## Table of Contents

1. [React Patterns Relevant to This Dashboard](#1-react-patterns-relevant-to-this-dashboard)
2. [Component Architecture](#2-component-architecture)
3. [Data Fetching Patterns](#3-data-fetching-patterns)
4. [Real-Time Updates](#4-real-time-updates)
5. [Performance](#5-performance)
6. [Error Boundaries, Loading States, and Suspense](#6-error-boundaries-loading-states-and-suspense)
7. [Practical Component Examples](#7-practical-component-examples)

---

## 1. React Patterns Relevant to This Dashboard

### 1.1 Server Components vs Client Components

Next.js App Router defaults every component to a **Server Component** (SC). Server Components
run exclusively on the server — they can `await` database calls, read environment variables,
and never ship their JavaScript to the browser.

A **Client Component** (CC) opts in with `"use client"` at the top of the file. It ships JS to
the browser, can use `useState`, `useEffect`, event handlers, and browser APIs.

> **Coming from Laravel/PHP**: Think of Server Components as Blade templates that execute on the
> server and send HTML. Client Components are like Livewire components — they run in the browser
> and react to user input. The key difference: in Next.js, both are written in the same language
> (TypeScript/JSX) rather than splitting between PHP and Alpine.js.

**The serialization boundary** is the critical concept. When a Server Component renders a Client
Component, every prop it passes must be serializable to JSON. You cannot pass a Prisma model
instance, a function, a `Date` object (use ISO strings), or a class instance.

```
Server Component (runs on server, no JS shipped)
  |--- passes serializable props ---> Client Component (ships JS, has interactivity)
```

**Decision framework for Crivline:**

| Use a Server Component when...                 | Use a Client Component when...                   |
|------------------------------------------------|--------------------------------------------------|
| Rendering the flag list from the database      | The flag toggle switch needs onClick             |
| Displaying audit log entries                   | The rule builder needs drag-and-drop / forms     |
| Showing project metadata                       | The environment switcher dropdown needs state    |
| Layout shells, navigation structure            | Any component using useState, useEffect, useRef  |
| Anything that just displays data               | Anything responding to user interaction          |

```tsx
// app/projects/[projectId]/flags/page.tsx — Server Component (default)
// No "use client" directive. This runs on the server.

import { prisma } from "@/lib/prisma";
import { FlagList } from "@/components/flags/flag-list";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function FlagsPage({ params }: PageProps) {
  const { projectId } = await params;

  // Direct database call — this never reaches the browser
  const flags = await prisma.flag.findMany({
    where: { projectId },
    include: { environment: true },
    orderBy: { createdAt: "desc" },
  });

  // Serialize before handing to the client component
  const serializedFlags = flags.map((flag) => ({
    id: flag.id,
    key: flag.key,
    name: flag.name,
    enabled: flag.enabled,
    environmentId: flag.environmentId,
    environmentName: flag.environment.name,
    createdAt: flag.createdAt.toISOString(),
    updatedAt: flag.updatedAt.toISOString(),
  }));

  // FlagList is a Client Component — it receives plain JSON
  return <FlagList flags={serializedFlags} projectId={projectId} />;
}
```

```tsx
// components/flags/flag-list.tsx — Client Component
"use client";

import { useState } from "react";
import { FlagToggle } from "./flag-toggle";

interface SerializedFlag {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  environmentId: string;
  environmentName: string;
  createdAt: string;
  updatedAt: string;
}

interface FlagListProps {
  flags: SerializedFlag[];
  projectId: string;
}

export function FlagList({ flags: initialFlags, projectId }: FlagListProps) {
  const [search, setSearch] = useState("");

  const filtered = initialFlags.filter(
    (f) =>
      f.key.toLowerCase().includes(search.toLowerCase()) ||
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search flags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded border px-3 py-2"
      />
      <ul className="mt-4 space-y-2">
        {filtered.map((flag) => (
          <li key={flag.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <code className="font-mono text-sm">{flag.key}</code>
              <p className="text-sm text-gray-600">{flag.name}</p>
            </div>
            <FlagToggle flagId={flag.id} initialEnabled={flag.enabled} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 1.2 React Context for Global State

Crivline has two pieces of truly global UI state: the **current project** and the **current
environment**. Every API call, every flag list, every audit log is scoped to these two values.

> **Coming from Laravel/PHP**: This is similar to how you might store `session('current_team_id')`
> and access it everywhere via middleware or a helper. In React, Context is the equivalent of a
> service container binding that any component can resolve — except it flows through the
> component tree rather than a global singleton.

**When to use Context vs URL state vs a state manager:**

| Approach        | Use when...                                                         | Crivline example                               |
|-----------------|---------------------------------------------------------------------|-------------------------------------------------|
| React Context   | State is read by many deeply nested components                      | Current project, current environment, theme     |
| URL state       | State should survive refresh, be shareable, appear in browser bar   | Selected flag ID, audit log filters, pagination |
| State manager   | Complex cross-cutting state with derived values and side effects    | Generally overkill for Crivline — avoid unless needed |

```tsx
// providers/project-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

// -- Types -------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;
  slug: string;
}

export interface Environment {
  id: string;
  name: string;       // "production", "staging", "development"
  color: string;      // hex color for UI badges
  projectId: string;
}

interface ProjectContextValue {
  /** The currently selected project. Null only during initial load. */
  currentProject: Project | null;
  /** All projects the user has access to. */
  projects: Project[];
  /** Switch to a different project. Resets environment to that project's default. */
  switchProject: (projectId: string) => void;
  /** The currently selected environment within the current project. */
  currentEnvironment: Environment | null;
  /** All environments for the current project. */
  environments: Environment[];
  /** Switch to a different environment within the current project. */
  switchEnvironment: (environmentId: string) => void;
}

// -- Context -----------------------------------------------------------------

const ProjectContext = createContext<ProjectContextValue | null>(null);

// -- Provider ----------------------------------------------------------------

interface ProjectProviderProps {
  children: ReactNode;
  initialProjects: Project[];
  initialEnvironments: Environment[];
  initialProjectId: string;
  initialEnvironmentId: string;
}

export function ProjectProvider({
  children,
  initialProjects,
  initialEnvironments,
  initialProjectId,
  initialEnvironmentId,
}: ProjectProviderProps) {
  const [projects] = useState<Project[]>(initialProjects);
  const [environments, setEnvironments] = useState<Environment[]>(initialEnvironments);
  const [currentProjectId, setCurrentProjectId] = useState(initialProjectId);
  const [currentEnvironmentId, setCurrentEnvironmentId] = useState(initialEnvironmentId);

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId) ?? null,
    [projects, currentProjectId]
  );

  const currentEnvironment = useMemo(
    () => environments.find((e) => e.id === currentEnvironmentId) ?? null,
    [environments, currentEnvironmentId]
  );

  const switchProject = useCallback(
    async (projectId: string) => {
      setCurrentProjectId(projectId);
      const res = await fetch(`/api/projects/${projectId}/environments`);
      const envs: Environment[] = await res.json();
      setEnvironments(envs);
      if (envs.length > 0) {
        setCurrentEnvironmentId(envs[0].id);
      }
    },
    []
  );

  const switchEnvironment = useCallback((environmentId: string) => {
    setCurrentEnvironmentId(environmentId);
  }, []);

  const value = useMemo<ProjectContextValue>(
    () => ({
      currentProject,
      projects,
      switchProject,
      currentEnvironment,
      environments,
      switchEnvironment,
    }),
    [currentProject, projects, switchProject, currentEnvironment, environments, switchEnvironment]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

// -- Hook --------------------------------------------------------------------

export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProject must be used within a <ProjectProvider>");
  }
  return ctx;
}
```

### 1.3 Custom Hooks

> **Coming from Laravel/PHP**: Custom hooks are the React equivalent of Laravel service classes
> or action classes. They encapsulate a unit of reusable logic — data fetching, subscriptions,
> computed values — and expose a clean interface. Like `App\Actions\CreateFlag`, a `useFlags()`
> hook hides the implementation details behind a stable return type.

#### useFlags

```tsx
// hooks/use-flags.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";

// -- Types -------------------------------------------------------------------

export interface Flag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  flagType: "boolean" | "string" | "number" | "json";
  defaultValue: string;
  rules: TargetingRule[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TargetingRule {
  id: string;
  priority: number;
  operator: "AND" | "OR";
  conditions: RuleCondition[];
  value: string;
  rolloutPercentage: number;
}

export interface RuleCondition {
  id: string;
  attribute: string;
  operator: "eq" | "neq" | "contains" | "gt" | "lt" | "in" | "regex";
  value: string;
}

interface UseFlagsOptions {
  search?: string;
  tags?: string[];
  enabled?: boolean;
}

// -- Hook --------------------------------------------------------------------

export function useFlags(options: UseFlagsOptions = {}) {
  const { currentProject, currentEnvironment } = useProject();
  const queryClient = useQueryClient();

  const queryKey = [
    "flags",
    currentProject?.id,
    currentEnvironment?.id,
    options,
  ] as const;

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Flag[]> => {
      const params = new URLSearchParams();
      if (options.search) params.set("search", options.search);
      if (options.tags?.length) params.set("tags", options.tags.join(","));
      if (options.enabled !== undefined) params.set("enabled", String(options.enabled));

      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/flags?${params}`
      );
      if (!res.ok) throw new Error(`Failed to fetch flags: ${res.status}`);
      return res.json();
    },
    enabled: !!currentProject && !!currentEnvironment,
    staleTime: 30_000,
  });

  // -- Toggle mutation with optimistic update --

  const toggleMutation = useMutation({
    mutationFn: async ({ flagId, enabled }: { flagId: string; enabled: boolean }) => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/flags/${flagId}/toggle`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }
      );
      if (!res.ok) throw new Error(`Toggle failed: ${res.status}`);
      return res.json();
    },
    onMutate: async ({ flagId, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Flag[]>(queryKey);
      queryClient.setQueryData<Flag[]>(queryKey, (old) =>
        old?.map((f) => (f.id === flagId ? { ...f, enabled } : f))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    flags: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    toggleFlag: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
```

#### useAuditLog

```tsx
// hooks/use-audit-log.ts
"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";

// -- Types -------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  action:
    | "flag.created" | "flag.updated" | "flag.toggled" | "flag.deleted"
    | "rule.created" | "rule.updated" | "rule.deleted"
    | "apikey.created" | "apikey.revoked"
    | "environment.created" | "project.settings_updated";
  entityType: "flag" | "rule" | "apikey" | "environment" | "project";
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  userEmail: string;
  diff: Record<string, { old: unknown; new: unknown }> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogPage {
  entries: AuditLogEntry[];
  nextCursor: string | null;
  totalCount: number;
}

interface UseAuditLogOptions {
  entityType?: AuditLogEntry["entityType"];
  entityId?: string;
  userId?: string;
  pageSize?: number;
}

// -- Hook --------------------------------------------------------------------

export function useAuditLog(options: UseAuditLogOptions = {}) {
  const { currentProject } = useProject();
  const pageSize = options.pageSize ?? 25;

  return useInfiniteQuery({
    queryKey: ["audit-log", currentProject?.id, options] as const,
    queryFn: async ({ pageParam }): Promise<AuditLogPage> => {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      if (pageParam) params.set("cursor", pageParam);
      if (options.entityType) params.set("entityType", options.entityType);
      if (options.entityId) params.set("entityId", options.entityId);
      if (options.userId) params.set("userId", options.userId);

      const res = await fetch(
        `/api/projects/${currentProject!.id}/audit-log?${params}`
      );
      if (!res.ok) throw new Error(`Failed to fetch audit log: ${res.status}`);
      return res.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!currentProject,
    staleTime: 10_000,
  });
}
```

#### useSSE

```tsx
// hooks/use-sse.ts
"use client";

import { useEffect, useRef, useState } from "react";

// -- Types -------------------------------------------------------------------

export interface SSEOptions<T = unknown> {
  /** The SSE endpoint URL. Pass null to disconnect. */
  url: string | null;
  /** Called for each parsed event. */
  onMessage: (event: T) => void;
  /** Called when the connection opens. */
  onOpen?: () => void;
  /** Called on error (before automatic reconnect). */
  onError?: (error: Event) => void;
  /** Maximum reconnection attempts before giving up. Default: 10. */
  maxRetries?: number;
  /** Custom event name to listen for. Default: "message". */
  eventName?: string;
}

export interface SSEState {
  isConnected: boolean;
  retryCount: number;
  lastEventTime: number | null;
}

// -- Hook --------------------------------------------------------------------

export function useSSE<T = unknown>(options: SSEOptions<T>): SSEState {
  const {
    url,
    onMessage,
    onOpen,
    onError,
    maxRetries = 10,
    eventName = "message",
  } = options;

  const [state, setState] = useState<SSEState>({
    isConnected: false,
    retryCount: 0,
    lastEventTime: null,
  });

  // Refs keep callback references stable across re-renders without
  // requiring them in the effect dependency array.
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);

  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  useEffect(() => { onOpenRef.current = onOpen; }, [onOpen]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!url) {
      setState((s) => ({ ...s, isConnected: false }));
      return;
    }

    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    let disposed = false;

    function connect() {
      if (disposed) return;

      eventSource = new EventSource(url!);

      eventSource.addEventListener("open", () => {
        if (disposed) return;
        retryCount = 0;
        setState({ isConnected: true, retryCount: 0, lastEventTime: Date.now() });
        onOpenRef.current?.();
      });

      eventSource.addEventListener(eventName, (event: MessageEvent) => {
        if (disposed) return;
        try {
          const parsed = JSON.parse(event.data) as T;
          setState((s) => ({ ...s, lastEventTime: Date.now() }));
          onMessageRef.current(parsed);
        } catch {
          console.error("[useSSE] Failed to parse event data:", event.data);
        }
      });

      eventSource.addEventListener("error", (event) => {
        if (disposed) return;
        onErrorRef.current?.(event);
        eventSource?.close();
        setState((s) => ({ ...s, isConnected: false }));

        if (retryCount < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s, 8s... capped at 30s
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30_000);
          retryCount++;
          setState((s) => ({ ...s, retryCount }));
          retryTimeout = setTimeout(connect, delay);
        }
      });
    }

    connect();

    return () => {
      disposed = true;
      eventSource?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [url, maxRetries, eventName]);

  return state;
}
```

### 1.4 Component Tree and Data Flow Architecture

```
app/layout.tsx  (Server Component — root layout)
+-- <html> / <body>
+-- AuthProvider (session from server, passed as prop)
|   +-- QueryProvider ("use client" — wraps TanStack QueryClientProvider)
|       +-- ProjectProvider (current project + environment context)
|           +-- ThemeProvider (light/dark mode)
|               +-- app/(dashboard)/layout.tsx (Server Component)
|                   +-- Sidebar (Client Component)
|                   |   +-- ProjectSelector (reads ProjectContext)
|                   |   +-- EnvironmentSwitcher (reads ProjectContext)
|                   |   +-- NavLinks (flags, audit log, settings, API keys)
|                   +-- TopBar (Client Component — user menu, notifications)
|                   +-- <main> (slot for page content)
|                       +-- app/(dashboard)/projects/[projectId]/flags/page.tsx
|                           +-- Server Component: fetches initial flags from DB
|                           +-- FlagList (Client Component)
|                               +-- FlagSearchBar (controlled input)
|                               +-- FlagRow (per-flag display)
|                               |   +-- FlagToggle (optimistic toggle)
|                               |   +-- Badge (environment tag)
|                               |   +-- FlagActions (edit, delete, copy key)
|                               +-- EmptyState (when no flags match)
```

Data flows **down** through props and context. User actions flow **up** through callbacks and
mutations. There is no global event bus or Vuex/Redux-style store.

> **Coming from Laravel/PHP**: In a Blade/Livewire app, the server re-renders HTML on every
> state change. In React, the virtual DOM diffs handle incremental updates. The component tree
> above is analogous to your `layouts/app.blade.php` + `@yield('content')` + Livewire components
> nested inside. The difference is that React components are functions that re-execute when
> their inputs change, producing a new virtual DOM tree that React reconciles with the real DOM.

---

## 2. Component Architecture

### 2.1 Layout Structure

```tsx
// app/(dashboard)/layout.tsx — Server Component
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ProjectProvider } from "@/providers/project-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { environments: true },
    orderBy: { name: "asc" },
  });

  const defaultProject = projects[0];
  const defaultEnvironment = defaultProject?.environments[0];

  const serializedProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
  }));

  const serializedEnvironments = (defaultProject?.environments ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    color: e.color,
    projectId: e.projectId,
  }));

  return (
    <ProjectProvider
      initialProjects={serializedProjects}
      initialEnvironments={serializedEnvironments}
      initialProjectId={defaultProject?.id ?? ""}
      initialEnvironmentId={defaultEnvironment?.id ?? ""}
    >
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar projects={serializedProjects} user={session.user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar user={session.user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </ProjectProvider>
  );
}
```

### 2.2 Reusable UI Components

> **Coming from Laravel/PHP**: These are the equivalent of Blade components
> (`<x-button>`, `<x-input>`, `<x-modal>`). The key difference: in React, every prop is
> type-checked at compile time by TypeScript, and components can manage their own internal state.

#### Button

```tsx
// components/ui/button.tsx
"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
    </button>
  )
);

Button.displayName = "Button";
```

#### Modal

```tsx
// components/ui/modal.tsx
"use client";

import { Fragment, type ReactNode } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-4xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "max-w-lg",
}: ModalProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={`w-full ${size} rounded-xl bg-white p-6 shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    {title}
                  </DialogTitle>
                  {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">{children}</div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
```

#### DataTable

```tsx
// components/ui/data-table.tsx
"use client";

import { type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = "No data found.",
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${col.width ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-sm text-gray-900"
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2.3 Form Handling with React Hook Form + Zod

> **Coming from Laravel/PHP**: In Laravel, you define validation rules in a FormRequest or
> inline in the controller (`$request->validate([...])`) and the framework handles error
> messages. React Hook Form + Zod gives you the same thing on the client side — Zod schemas
> are like your `rules()` array, and React Hook Form manages form state, dirty tracking, and
> submission similar to how Livewire manages wire:model bindings.

#### Creating a Flag

```tsx
// components/flags/create-flag-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";
import { Button } from "@/components/ui/button";

// -- Schema (equivalent to Laravel FormRequest rules) ------------------------

const createFlagSchema = z.object({
  key: z
    .string()
    .min(1, "Flag key is required")
    .max(100, "Key must be 100 characters or fewer")
    .regex(
      /^[a-z][a-z0-9._-]*$/,
      "Key must start with a lowercase letter and contain only a-z, 0-9, '.', '_', '-'"
    ),
  name: z.string().min(1, "Display name is required").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  flagType: z.enum(["boolean", "string", "number", "json"], {
    required_error: "Select a flag type",
  }),
  defaultValue: z.string().min(1, "Default value is required"),
  tags: z.array(z.string()).default([]),
});

type CreateFlagInput = z.infer<typeof createFlagSchema>;

// -- Component ---------------------------------------------------------------

interface CreateFlagFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateFlagForm({ onSuccess, onCancel }: CreateFlagFormProps) {
  const { currentProject, currentEnvironment } = useProject();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setError,
  } = useForm<CreateFlagInput>({
    resolver: zodResolver(createFlagSchema),
    defaultValues: {
      key: "",
      name: "",
      description: "",
      flagType: "boolean",
      defaultValue: "false",
      tags: [],
    },
  });

  const flagType = watch("flagType");

  const mutation = useMutation({
    mutationFn: async (data: CreateFlagInput) => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/flags`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (res.status === 409) {
        throw new Error("KEY_EXISTS");
      }
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      onSuccess();
    },
    onError: (error) => {
      if (error.message === "KEY_EXISTS") {
        setError("key", {
          message: "This flag key already exists in this environment.",
        });
      }
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
    >
      {/* Flag Key */}
      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-700">
          Flag Key
        </label>
        <input
          id="key"
          {...register("key")}
          placeholder="enable.new-checkout"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.key && (
          <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
        )}
      </div>

      {/* Display Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Display Name
        </label>
        <input
          id="name"
          {...register("name")}
          placeholder="New Checkout Flow"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {/* Flag Type */}
      <div>
        <label
          htmlFor="flagType"
          className="block text-sm font-medium text-gray-700"
        >
          Type
        </label>
        <select
          id="flagType"
          {...register("flagType")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="boolean">Boolean (on/off)</option>
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="json">JSON</option>
        </select>
      </div>

      {/* Default Value — shape changes based on flagType */}
      <div>
        <label
          htmlFor="defaultValue"
          className="block text-sm font-medium text-gray-700"
        >
          Default Value
        </label>
        {flagType === "boolean" ? (
          <select
            id="defaultValue"
            {...register("defaultValue")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="false">false (off)</option>
            <option value="true">true (on)</option>
          </select>
        ) : (
          <input
            id="defaultValue"
            {...register("defaultValue")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        )}
        {errors.defaultValue && (
          <p className="mt-1 text-sm text-red-600">
            {errors.defaultValue.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={mutation.isPending}
          disabled={!isDirty}
        >
          Create Flag
        </Button>
      </div>
    </form>
  );
}
```

### 2.4 Compound Component Pattern — RuleBuilder

Compound components share implicit state through Context. The parent manages the overall
structure while children render specific parts.

> **Coming from Laravel/PHP**: Think of this like a Blade component that uses slots and
> `@aware` to let child components access parent state. For example, a `<x-form-section>`
> that automatically groups its `<x-input>` children.

```tsx
// components/rules/rule-builder.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

// -- Types -------------------------------------------------------------------

export interface RuleFormValues {
  rules: {
    operator: "AND" | "OR";
    value: string;
    rolloutPercentage: number;
    conditions: {
      attribute: string;
      operator: string;
      value: string;
    }[];
  }[];
}

// -- Internal Context --------------------------------------------------------

interface RuleBuilderContextValue {
  ruleIndex: number;
  removeRule: () => void;
}

const RuleBuilderContext = createContext<RuleBuilderContextValue | null>(null);

function useRuleBuilder() {
  const ctx = useContext(RuleBuilderContext);
  if (!ctx) throw new Error("Rule components must be inside <RuleBuilder>");
  return ctx;
}

// -- Root Component ----------------------------------------------------------

function RuleBuilderRoot({ children }: { children?: ReactNode }) {
  const { control } = useFormContext<RuleFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <RuleBuilderContext.Provider
          key={field.id}
          value={{ ruleIndex: index, removeRule: () => remove(index) }}
        >
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <RuleHeader />
            <ConditionList />
            <RuleValue />
          </div>
        </RuleBuilderContext.Provider>
      ))}
      <Button
        type="button"
        variant="secondary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={() =>
          append({
            operator: "AND",
            value: "true",
            rolloutPercentage: 100,
            conditions: [{ attribute: "", operator: "eq", value: "" }],
          })
        }
      >
        Add Rule
      </Button>
    </div>
  );
}

// -- Sub-components ----------------------------------------------------------

function RuleHeader() {
  const { ruleIndex, removeRule } = useRuleBuilder();
  const { register } = useFormContext<RuleFormValues>();

  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
        <span className="text-sm font-medium text-gray-700">
          Rule {ruleIndex + 1}
        </span>
        <select
          {...register(`rules.${ruleIndex}.operator`)}
          className="rounded border border-gray-300 px-2 py-1 text-xs"
        >
          <option value="AND">Match ALL conditions (AND)</option>
          <option value="OR">Match ANY condition (OR)</option>
        </select>
      </div>
      <button
        type="button"
        onClick={removeRule}
        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConditionList() {
  const { ruleIndex } = useRuleBuilder();
  const { control, register } = useFormContext<RuleFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `rules.${ruleIndex}.conditions`,
  });

  const ATTRIBUTE_OPTIONS = [
    { value: "user.id", label: "User ID" },
    { value: "user.email", label: "User Email" },
    { value: "user.plan", label: "Plan" },
    { value: "user.country", label: "Country" },
    { value: "user.created_at", label: "Signup Date" },
    { value: "custom", label: "Custom Attribute..." },
  ];

  const OPERATOR_OPTIONS = [
    { value: "eq", label: "equals" },
    { value: "neq", label: "does not equal" },
    { value: "contains", label: "contains" },
    { value: "gt", label: "greater than" },
    { value: "lt", label: "less than" },
    { value: "in", label: "is one of" },
    { value: "regex", label: "matches regex" },
  ];

  return (
    <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-4">
      {fields.map((field, condIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <select
            {...register(
              `rules.${ruleIndex}.conditions.${condIndex}.attribute`
            )}
            className="w-40 rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">Select attribute...</option>
            {ATTRIBUTE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            {...register(
              `rules.${ruleIndex}.conditions.${condIndex}.operator`
            )}
            className="w-36 rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            {OPERATOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            {...register(
              `rules.${ruleIndex}.conditions.${condIndex}.value`
            )}
            placeholder="Value"
            className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm"
          />

          <button
            type="button"
            onClick={() => remove(condIndex)}
            className="rounded p-1 text-gray-400 hover:text-red-600"
            disabled={fields.length === 1}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ attribute: "", operator: "eq", value: "" })}
        className="text-xs text-indigo-600 hover:text-indigo-800"
      >
        + Add condition
      </button>
    </div>
  );
}

function RuleValue() {
  const { ruleIndex } = useRuleBuilder();
  const { register } = useFormContext<RuleFormValues>();

  return (
    <div className="mt-3 flex items-center gap-4 border-t pt-3">
      <label className="text-sm text-gray-600">Serve value:</label>
      <input
        {...register(`rules.${ruleIndex}.value`)}
        className="w-32 rounded border border-gray-300 px-2 py-1.5 text-sm"
      />
      <label className="text-sm text-gray-600">to</label>
      <input
        type="number"
        min={0}
        max={100}
        {...register(`rules.${ruleIndex}.rolloutPercentage`, {
          valueAsNumber: true,
        })}
        className="w-20 rounded border border-gray-300 px-2 py-1.5 text-sm"
      />
      <span className="text-sm text-gray-600">% of matching users</span>
    </div>
  );
}

// -- Compound export ---------------------------------------------------------

export const RuleBuilder = Object.assign(RuleBuilderRoot, {
  Header: RuleHeader,
  Conditions: ConditionList,
  Value: RuleValue,
});
```

### 2.5 Controlled vs Uncontrolled Components

| Pattern         | Description                                                  | When to use in Crivline                              |
|-----------------|--------------------------------------------------------------|------------------------------------------------------|
| Controlled      | React state is the source of truth (`value` + `onChange`)    | Flag toggle, environment switcher, search inputs     |
| Uncontrolled    | DOM is the source of truth (accessed via `ref` on submit)    | Simple forms where you only need value on submit     |
| React Hook Form | Hybrid — uses refs internally, exposes a controlled-style API| All Crivline forms: create flag, edit rules, settings|

> **Coming from Laravel/PHP**: Controlled components are like Livewire's `wire:model` — every
> keystroke syncs state. Uncontrolled is like a plain HTML form that you only read on
> `$request->all()`. React Hook Form is the sweet spot: it avoids re-rendering on every
> keystroke (like uncontrolled) but gives you a controlled-style API for validation and
> submission.

---

## 3. Data Fetching Patterns

### 3.1 TanStack Query Setup

```tsx
// providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Create the client inside useState so it is stable across re-renders
  // but unique per user session (important for SSR).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

> **Coming from Laravel/PHP**: TanStack Query is the React equivalent of writing a repository
> pattern with built-in HTTP caching, retry logic, and background refetching. Imagine if every
> `$this->flagRepository->findAll()` call automatically cached the result, showed stale data
> while refreshing, and invalidated when you called `$this->flagRepository->create()`.

### 3.2 Server Component Data Fetching

Server Components can `await` directly — no `useEffect`, no loading spinners by default.

```tsx
// app/(dashboard)/projects/[projectId]/flags/page.tsx
import { prisma } from "@/lib/prisma";
import { FlagList } from "@/components/flags/flag-list";
import { Suspense } from "react";
import { FlagListSkeleton } from "@/components/flags/flag-list-skeleton";

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ env?: string; search?: string }>;
}

export default async function FlagsPage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const { env, search } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold">Feature Flags</h1>
      <Suspense fallback={<FlagListSkeleton />}>
        <FlagListLoader
          projectId={projectId}
          environmentId={env}
          search={search}
        />
      </Suspense>
    </div>
  );
}

// Separate async component caught by the Suspense boundary
async function FlagListLoader({
  projectId,
  environmentId,
  search,
}: {
  projectId: string;
  environmentId?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = { projectId };
  if (environmentId) where.environmentId = environmentId;
  if (search) {
    where.OR = [
      { key: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const flags = await prisma.flag.findMany({
    where,
    include: {
      environment: true,
      rules: { include: { conditions: true } },
    },
    orderBy: { key: "asc" },
  });

  const serialized = flags.map((f) => ({
    id: f.id,
    key: f.key,
    name: f.name,
    description: f.description,
    enabled: f.enabled,
    flagType: f.flagType,
    defaultValue: f.defaultValue,
    environmentName: f.environment.name,
    environmentColor: f.environment.color,
    rulesCount: f.rules.length,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  }));

  return <FlagList flags={serialized} projectId={projectId} />;
}
```

### 3.3 Optimistic Updates for Flag Toggles

The flow covered in the `useFlags` hook (Section 1.3):

```
User clicks toggle
  -> onMutate: cache updated immediately (enabled: true -> false)
  -> UI re-renders instantly with new state
  -> mutationFn: PATCH /api/.../flags/:id/toggle fires
  -> Server responds 200 OK
     -> onSettled: invalidate query (ensures consistency)
  -> Server responds 500 Error
     -> onError: restore snapshot from onMutate
     -> UI re-renders back to original state
     -> Toast notification: "Failed to toggle flag"
```

> **Coming from Laravel/PHP**: This is something you typically do not get in Livewire unless
> you write custom Alpine.js. Livewire's round-trip model means every toggle sends a request,
> waits for response, then updates the UI. Optimistic updates flip the UI first, making the
> dashboard feel instant.

### 3.4 Pagination for Audit Logs

```tsx
// components/audit/audit-log-list.tsx
"use client";

import { useAuditLog, type AuditLogEntry } from "@/hooks/use-audit-log";
import { formatDistanceToNow } from "date-fns";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export function AuditLogList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useAuditLog({ pageSize: 25 });

  // Infinite scroll: fetch next page when sentinel comes into view
  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <AuditLogSkeleton />;
  if (isError)
    return <div className="text-red-600">Failed to load audit log.</div>;

  const entries = data?.pages.flatMap((page) => page.entries) ?? [];

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <AuditLogRow key={entry.id} entry={entry} />
      ))}

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="py-4 text-center text-sm text-gray-500">
          Loading more...
        </div>
      )}

      {!hasNextPage && entries.length > 0 && (
        <div className="py-4 text-center text-sm text-gray-400">
          End of audit log ({entries.length} entries)
        </div>
      )}
    </div>
  );
}

function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
  const actionLabels: Record<string, string> = {
    "flag.created": "created flag",
    "flag.updated": "updated flag",
    "flag.toggled": "toggled flag",
    "flag.deleted": "deleted flag",
    "rule.created": "added targeting rule on",
    "rule.updated": "updated targeting rule on",
    "rule.deleted": "removed targeting rule from",
    "apikey.created": "created API key",
    "apikey.revoked": "revoked API key",
  };

  return (
    <div className="flex items-start gap-3 rounded border px-4 py-3">
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium text-gray-900">{entry.userName}</span>{" "}
          <span className="text-gray-600">
            {actionLabels[entry.action] ?? entry.action}
          </span>{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            {entry.entityName}
          </code>
        </p>
        {entry.diff && (
          <pre className="mt-1 text-xs text-gray-500">
            {JSON.stringify(entry.diff, null, 2)}
          </pre>
        )}
      </div>
      <time className="shrink-0 text-xs text-gray-400" title={entry.createdAt}>
        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
      </time>
    </div>
  );
}

function AuditLogSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded border bg-gray-50" />
      ))}
    </div>
  );
}
```

### 3.5 Prefetching on Hover/Focus

```tsx
// components/layout/nav-link.tsx
"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, type ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  prefetchQueryKey?: readonly unknown[];
  prefetchFn?: () => Promise<unknown>;
}

export function NavLink({
  href,
  children,
  prefetchQueryKey,
  prefetchFn,
}: NavLinkProps) {
  const queryClient = useQueryClient();

  const handlePrefetch = useCallback(() => {
    if (prefetchQueryKey && prefetchFn) {
      queryClient.prefetchQuery({
        queryKey: prefetchQueryKey,
        queryFn: prefetchFn,
        staleTime: 30_000,
      });
    }
  }, [queryClient, prefetchQueryKey, prefetchFn]);

  return (
    <Link
      href={href}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
      prefetch={true}
    >
      {children}
    </Link>
  );
}
```

---

## 4. Real-Time Updates

### 4.1 Consuming SSE Streams

The `useSSE` hook (Section 1.3) provides the low-level connection. Here is how to integrate
it with the Crivline dashboard to update flags when another user toggles a flag.

```tsx
// hooks/use-flag-updates.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";
import { useSSE } from "@/hooks/use-sse";
import { useCallback, useMemo } from "react";
import type { Flag } from "@/hooks/use-flags";

// -- SSE Event Types ---------------------------------------------------------

interface FlagUpdatedEvent {
  type: "flag.updated";
  flagId: string;
  changes: Partial<Flag>;
}

interface FlagCreatedEvent {
  type: "flag.created";
  flag: Flag;
}

interface FlagDeletedEvent {
  type: "flag.deleted";
  flagId: string;
}

type FlagEvent = FlagUpdatedEvent | FlagCreatedEvent | FlagDeletedEvent;

// -- Hook --------------------------------------------------------------------

export function useFlagUpdates() {
  const queryClient = useQueryClient();
  const { currentProject, currentEnvironment } = useProject();

  const url = useMemo(() => {
    if (!currentProject || !currentEnvironment) return null;
    return `/api/projects/${currentProject.id}/environments/${currentEnvironment.id}/flags/stream`;
  }, [currentProject, currentEnvironment]);

  const handleMessage = useCallback(
    (event: FlagEvent) => {
      const queryKey = [
        "flags",
        currentProject?.id,
        currentEnvironment?.id,
      ];

      switch (event.type) {
        case "flag.updated":
          queryClient.setQueryData<Flag[]>(queryKey, (old) =>
            old?.map((f) =>
              f.id === event.flagId ? { ...f, ...event.changes } : f
            )
          );
          break;

        case "flag.created":
          queryClient.setQueryData<Flag[]>(queryKey, (old) =>
            old ? [...old, event.flag] : [event.flag]
          );
          break;

        case "flag.deleted":
          queryClient.setQueryData<Flag[]>(queryKey, (old) =>
            old?.filter((f) => f.id !== event.flagId)
          );
          break;
      }
    },
    [queryClient, currentProject?.id, currentEnvironment?.id]
  );

  return useSSE<FlagEvent>({
    url,
    onMessage: handleMessage,
    maxRetries: 10,
    eventName: "flag-event",
  });
}
```

### 4.2 Integrating SSE with TanStack Query Cache

The key insight: **SSE events patch the cache directly**, avoiding a full refetch.

- `setQueryData` -- updates the cache in-place, no network request. Use for real-time patches.
- `invalidateQueries` -- marks cache as stale and triggers a refetch. Use after mutations
  where you want the latest server state.

For Crivline, SSE events use `setQueryData` because the event payload contains the new state.
Mutations use `invalidateQueries` in `onSettled` as a safety net.

### 4.3 Using Flag Updates in a Component

```tsx
// components/flags/flag-list-with-realtime.tsx
"use client";

import { useFlags } from "@/hooks/use-flags";
import { useFlagUpdates } from "@/hooks/use-flag-updates";
import { FlagToggle } from "./flag-toggle";
import { Badge } from "@/components/ui/badge";

export function FlagListWithRealtime({ projectId }: { projectId: string }) {
  const { flags, isLoading } = useFlags();
  const { isConnected, retryCount } = useFlagUpdates();

  return (
    <div>
      {/* Connection status indicator */}
      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {isConnected
          ? "Live"
          : retryCount > 0
            ? `Reconnecting (${retryCount})...`
            : "Disconnected"}
      </div>

      {flags.map((flag) => (
        <div
          key={flag.id}
          className="flex items-center justify-between border-b py-3"
        >
          <div className="flex items-center gap-3">
            <code className="font-mono text-sm">{flag.key}</code>
            <Badge variant={flag.enabled ? "success" : "neutral"}>
              {flag.enabled ? "ON" : "OFF"}
            </Badge>
          </div>
          <FlagToggle flagId={flag.id} initialEnabled={flag.enabled} />
        </div>
      ))}
    </div>
  );
}
```

### 4.4 SSE vs WebSocket Trade-offs

| Aspect              | SSE (Crivline's choice)                         | WebSocket                                 |
|---------------------|-------------------------------------------------|-------------------------------------------|
| Direction           | Server -> Client only                           | Bidirectional                             |
| Protocol            | Standard HTTP (works with all proxies/CDNs)     | Upgrade handshake (some proxies need config)|
| Reconnection        | Built into the EventSource API                  | Must implement manually                   |
| Complexity          | Simple server handler (write to response stream)| Stateful connection management            |
| Crivline fit        | Ideal -- dashboard only receives updates        | Overkill -- dashboard does not send via WS|
| Scaling             | Standard HTTP load balancing                    | Sticky sessions or Redis pub/sub required |

SSE is the right choice for Crivline because the dashboard only *receives* real-time updates.
All user actions go through REST API mutations. If Crivline ever adds collaborative editing
(two users editing the same rule simultaneously), WebSocket would be worth revisiting.

---

## 5. Performance

### 5.1 React.memo

`React.memo` skips re-rendering when props have not changed (shallow comparison). It is
**not** free -- it adds a comparison step to every render cycle.

**When it matters in Crivline:**

```tsx
// components/flags/flag-row.tsx
"use client";

import { memo } from "react";
import { FlagToggle } from "./flag-toggle";

interface FlagRowProps {
  id: string;
  flagKey: string;
  name: string;
  enabled: boolean;
  environmentName: string;
}

// This component renders inside a list of 100+ flags.
// When one flag is toggled, the parent re-renders all FlagRow instances.
// Without memo, every FlagRow re-renders even though only one changed.
// With memo, only the toggled flag's row re-renders.

export const FlagRow = memo(function FlagRow({
  id,
  flagKey,
  name,
  enabled,
  environmentName,
}: FlagRowProps) {
  return (
    <div className="flex items-center justify-between border-b py-3">
      <div>
        <code className="font-mono text-sm">{flagKey}</code>
        <p className="text-xs text-gray-500">{name}</p>
      </div>
      <FlagToggle flagId={id} initialEnabled={enabled} />
    </div>
  );
});
```

**When it does NOT matter:**

```tsx
// CreateFlagForm renders in a modal -- only one instance, only when open.
// React.memo here adds overhead for zero benefit. Do NOT memo this.
export function CreateFlagForm({ onSuccess, onCancel }: CreateFlagFormProps) {
  // ...
}
```

**Rule of thumb**: Memo list item components that appear 20+ times. Do not memo forms, modals,
page-level components, or anything that renders once.

### 5.2 useMemo and useCallback

Both are **only worth using** when the cached value is either:

1. Passed as a prop to a memoized child (otherwise the child re-renders anyway).
2. Expensive to compute (e.g., filtering/sorting a large array).

```tsx
// WORTH IT: filtering 500 flags on every keystroke
const filteredFlags = useMemo(
  () =>
    flags.filter(
      (f) =>
        f.key.toLowerCase().includes(search.toLowerCase()) ||
        f.name.toLowerCase().includes(search.toLowerCase())
    ),
  [flags, search]
);

// WORTH IT: stable callback passed to memoized child component
const handleToggle = useCallback(
  (flagId: string, enabled: boolean) => {
    toggleFlag({ flagId, enabled });
  },
  [toggleFlag]
);

// NOT WORTH IT: inline formatting -- this is nanoseconds of work
const displayName = `${project.name} / ${environment.name}`;
```

> **Coming from Laravel/PHP**: The closest analogy is `Cache::remember()` -- you would not
> cache a simple string concatenation, but you would cache an expensive database query.
> Apply the same judgment to useMemo.

### 5.3 Virtualized Lists

When the audit log or flag list has hundreds of entries, rendering all DOM nodes is wasteful.
Virtualization only renders visible rows plus a small buffer.

```tsx
// components/audit/virtualized-audit-log.tsx
"use client";

import {
  FixedSizeList,
  type ListChildComponentProps,
} from "react-window";
import { useAuditLog } from "@/hooks/use-audit-log";
import { formatDistanceToNow } from "date-fns";
import { useRef, useCallback } from "react";

const ROW_HEIGHT = 72;

export function VirtualizedAuditLog() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAuditLog();
  const entries = data?.pages.flatMap((p) => p.entries) ?? [];
  const listRef = useRef<FixedSizeList>(null);

  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }: { visibleStopIndex: number }) => {
      if (
        visibleStopIndex >= entries.length - 10 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [entries.length, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const Row = ({ index, style }: ListChildComponentProps) => {
    const entry = entries[index];
    if (!entry) {
      return (
        <div
          style={style}
          className="flex items-center justify-center text-sm text-gray-400"
        >
          Loading...
        </div>
      );
    }

    return (
      <div style={style} className="flex items-center border-b px-4">
        <div className="flex-1">
          <span className="font-medium">{entry.userName}</span>{" "}
          <span className="text-gray-600">{entry.action}</span>{" "}
          <code className="text-xs">{entry.entityName}</code>
        </div>
        <time className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(entry.createdAt), {
            addSuffix: true,
          })}
        </time>
      </div>
    );
  };

  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      width="100%"
      itemCount={entries.length}
      itemSize={ROW_HEIGHT}
      onItemsRendered={handleItemsRendered}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 5.4 Bundle Size Awareness

**Dynamic imports** split code not needed on initial page load:

```tsx
import dynamic from "next/dynamic";

const RuleBuilder = dynamic(
  () =>
    import("@/components/rules/rule-builder").then((mod) => mod.RuleBuilder),
  {
    loading: () => (
      <div className="h-32 animate-pulse rounded bg-gray-100" />
    ),
    ssr: false,
  }
);
```

**Avoid barrel exports:**

```tsx
// BAD -- importing Button pulls in the entire ui/index.ts barrel
import { Button } from "@/components/ui";

// GOOD -- import directly; tree shaking works
import { Button } from "@/components/ui/button";
```

**Icon libraries -- import individual icons:**

```tsx
// BAD -- imports the entire lucide-react library (~200KB)
import * as Icons from "lucide-react";

// GOOD -- tree-shakes to just the icons you use (~2KB per icon)
import { Flag, Settings, Users } from "lucide-react";
```

### 5.5 React DevTools Profiler

1. Install the React DevTools browser extension.
2. Open your Crivline dashboard in development mode.
3. Navigate to the browser DevTools "Profiler" tab.
4. Click "Record", perform an action (e.g., toggle a flag), click "Stop".
5. The flamegraph shows every component that re-rendered and how long it took.

**What to look for in Crivline:**

- If toggling one flag causes the entire FlagList to show 50+ child re-renders, you need
  `React.memo` on `FlagRow`.
- If the Sidebar re-renders when you type in the search box, the search state is too high
  in the tree -- move it into the FlagList component.
- Grey bars mean "did not render" -- that is good. You want most components grey during a
  localized action.

---

## 6. Error Boundaries, Loading States, and Suspense

### 6.1 Error Boundary Components

React error boundaries are class components (no hook equivalent yet) that catch JavaScript
errors in their child tree.

> **Coming from Laravel/PHP**: Error boundaries are the React equivalent of `try/catch` in
> your controller or the `render` method in `App\Exceptions\Handler`. They prevent a single
> broken widget from taking down the entire page.

```tsx
// components/error-boundary.tsx
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[ErrorBoundary:${this.props.label ?? "unknown"}]`,
      error,
      errorInfo
    );
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
          <h3 className="text-lg font-semibold text-red-800">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() =>
              this.setState({ hasError: false, error: null })
            }
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 6.2 Suspense Boundaries in the Crivline Layout

Place Suspense boundaries at the **content region** level, not around every single component.

```tsx
// app/(dashboard)/projects/[projectId]/layout.tsx
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[260px_1fr] gap-6">
      <aside className="space-y-4">
        <ErrorBoundary label="ProjectSidebar">
          <Suspense fallback={<SidebarSkeleton />}>
            {/* Server-rendered project nav */}
          </Suspense>
        </ErrorBoundary>
      </aside>

      <ErrorBoundary label="ProjectContent">{children}</ErrorBoundary>
    </div>
  );
}
```

Recommended boundary placement for the flags page:

```
FlagsPage
+-- <h1> "Feature Flags" (renders instantly -- no boundary)
+-- Suspense boundary: <FlagListSkeleton />
|   +-- FlagListLoader (async -- fetches from DB)
|       +-- FlagList (client component with search/filter)
+-- Suspense boundary: <StatsSkeleton />
    +-- FlagStats (async -- aggregation query)
```

### 6.3 Loading Skeletons vs Spinners

| Use a skeleton when...                           | Use a spinner when...                     |
|--------------------------------------------------|-------------------------------------------|
| You know the shape of the content (list, table)  | Action is in progress (saving, deleting)  |
| Initial page load / route transition             | Short operations triggered by user click  |
| The content area is large                        | The area is small (button, toggle)        |

```tsx
// components/flags/flag-list-skeleton.tsx
export function FlagListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Search bar skeleton */}
      <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
      {/* Flag row skeletons */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded border p-4"
        >
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
```

### 6.4 Error Recovery Patterns

```tsx
// components/flags/flag-list-error.tsx
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface FlagListErrorProps {
  error: Error;
  onRetry: () => void;
}

export function FlagListError({ error, onRetry }: FlagListErrorProps) {
  const isNetworkError =
    error.message.includes("fetch") || error.message.includes("network");

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50 p-12">
      <AlertTriangle className="h-8 w-8 text-yellow-600" />
      <h3 className="mt-3 text-lg font-semibold text-yellow-800">
        {isNetworkError ? "Connection issue" : "Failed to load flags"}
      </h3>
      <p className="mt-1 max-w-md text-center text-sm text-yellow-700">
        {isNetworkError
          ? "Unable to reach the server. Check your connection and try again."
          : error.message}
      </p>
      <Button
        variant="secondary"
        className="mt-4"
        leftIcon={<RefreshCw className="h-4 w-4" />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}
```

Usage with TanStack Query:

```tsx
const { flags, isLoading, isError, error, refetch } = useFlags();

if (isError) return <FlagListError error={error} onRetry={() => refetch()} />;
```

---

## 7. Practical Component Examples

### 7.1 FlagToggle

```tsx
// components/flags/flag-toggle.tsx
"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";
import { cn } from "@/lib/utils";

interface FlagToggleProps {
  flagId: string;
  initialEnabled: boolean;
  canEdit?: boolean;
}

export function FlagToggle({
  flagId,
  initialEnabled,
  canEdit = true,
}: FlagToggleProps) {
  const { currentProject, currentEnvironment } = useProject();
  const queryClient = useQueryClient();

  // Local optimistic state for instant visual feedback
  const [optimisticEnabled, setOptimisticEnabled] = useState(initialEnabled);

  const mutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/flags/${flagId}/toggle`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enabled }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `Toggle failed (${res.status})`);
      }
      return res.json();
    },
    onMutate: (enabled) => {
      setOptimisticEnabled(enabled);
    },
    onError: (_err, _enabled) => {
      setOptimisticEnabled(!_enabled);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
    },
  });

  const handleToggle = useCallback(() => {
    if (!canEdit || mutation.isPending) return;
    mutation.mutate(!optimisticEnabled);
  }, [canEdit, mutation, optimisticEnabled]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimisticEnabled}
      aria-label={`Toggle flag ${flagId}`}
      disabled={!canEdit || mutation.isPending}
      onClick={handleToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        optimisticEnabled ? "bg-indigo-600" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          optimisticEnabled ? "translate-x-6" : "translate-x-1"
        )}
      />
      {mutation.isPending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </span>
      )}
    </button>
  );
}
```

### 7.2 PercentageSlider

```tsx
// components/flags/percentage-slider.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";

interface PercentageSliderProps {
  flagId: string;
  ruleId: string;
  initialPercentage: number;
}

export function PercentageSlider({
  flagId,
  ruleId,
  initialPercentage,
}: PercentageSliderProps) {
  const [localValue, setLocalValue] = useState(initialPercentage);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentProject, currentEnvironment } = useProject();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (percentage: number) => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/flags/${flagId}/rules/${ruleId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rolloutPercentage: percentage }),
        }
      );
      if (!res.ok) throw new Error("Failed to update percentage");
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
    },
  });

  // Debounce: fire API call 500ms after the user stops sliding
  const debouncedSave = useCallback(
    (value: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        mutation.mutate(value);
      }, 500);
    },
    [mutation]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setLocalValue(value);
    debouncedSave(value);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Visual rollout preview
  const gradientStyle = {
    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${localValue}%, #e5e7eb ${localValue}%, #e5e7eb 100%)`,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Rollout Percentage
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gray-900">
            {localValue}%
          </span>
          {mutation.isPending && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
          {mutation.isError && (
            <span className="text-xs text-red-500">Failed to save</span>
          )}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={localValue}
        onChange={handleChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-full"
        style={gradientStyle}
      />

      {/* Visual distribution preview */}
      <div className="flex gap-px">
        {Array.from({ length: 20 }).map((_, i) => {
          const threshold = (i + 1) * 5;
          return (
            <div
              key={i}
              className={`h-2 flex-1 rounded-sm transition-colors ${
                threshold <= localValue ? "bg-indigo-500" : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-500">
        {localValue === 0
          ? "No users will see this variant."
          : localValue === 100
            ? "All matching users will see this variant."
            : `Approximately ${localValue}% of matching users will see this variant.`}
      </p>
    </div>
  );
}
```

### 7.3 AuditLogFeed

Combines SSE for real-time updates with cursor-based pagination and filtering.

```tsx
// components/audit/audit-log-feed.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuditLog, type AuditLogEntry } from "@/hooks/use-audit-log";
import { useSSE } from "@/hooks/use-sse";
import { useQueryClient } from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, RefreshCw } from "lucide-react";

type EntityFilter = AuditLogEntry["entityType"] | "all";

export function AuditLogFeed() {
  const { currentProject } = useProject();
  const queryClient = useQueryClient();
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const [newEventsCount, setNewEventsCount] = useState(0);

  const filterOptions =
    entityFilter === "all"
      ? {}
      : { entityType: entityFilter as AuditLogEntry["entityType"] };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useAuditLog(filterOptions);

  // SSE for real-time audit log events
  const sseUrl = useMemo(
    () =>
      currentProject
        ? `/api/projects/${currentProject.id}/audit-log/stream`
        : null,
    [currentProject]
  );

  const handleSSEMessage = useCallback((_event: AuditLogEntry) => {
    // Show a "N new events" banner instead of immediately inserting
    // (which can be disorienting while the user is reading).
    setNewEventsCount((c) => c + 1);
  }, []);

  useSSE<AuditLogEntry>({
    url: sseUrl,
    onMessage: handleSSEMessage,
    eventName: "audit-event",
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    setNewEventsCount(0);
  }, [queryClient]);

  const entries = data?.pages.flatMap((p) => p.entries) ?? [];

  const actionColors: Record<
    string,
    "success" | "warning" | "danger" | "neutral"
  > = {
    "flag.created": "success",
    "flag.toggled": "warning",
    "flag.deleted": "danger",
    "apikey.revoked": "danger",
  };

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={entityFilter}
            onChange={(e) =>
              setEntityFilter(e.target.value as EntityFilter)
            }
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="all">All events</option>
            <option value="flag">Flags</option>
            <option value="rule">Rules</option>
            <option value="apikey">API Keys</option>
            <option value="environment">Environments</option>
            <option value="project">Project</option>
          </select>
        </div>
      </div>

      {/* New events banner */}
      {newEventsCount > 0 && (
        <button
          onClick={handleRefresh}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {newEventsCount} new{" "}
          {newEventsCount === 1 ? "event" : "events"} -- click to refresh
        </button>
      )}

      {/* Timeline */}
      {isLoading ? (
        <AuditFeedSkeleton />
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-5 top-0 w-px bg-gray-200" />

          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="relative flex gap-4 pl-10">
                <div className="absolute left-4 top-2 h-3 w-3 rounded-full border-2 border-white bg-gray-300 shadow-sm" />

                <div className="flex-1 rounded-lg border bg-white p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium">
                        {entry.userName}
                      </span>
                      <Badge
                        variant={
                          actionColors[entry.action] ?? "neutral"
                        }
                        className="ml-2"
                      >
                        {entry.action}
                      </Badge>
                    </div>
                    <time
                      className="text-xs text-gray-400"
                      title={new Date(entry.createdAt).toLocaleString()}
                    >
                      {formatDistanceToNow(new Date(entry.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    <code className="rounded bg-gray-100 px-1 text-xs">
                      {entry.entityName}
                    </code>
                  </p>
                  {entry.diff &&
                    Object.keys(entry.diff).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                          Show changes
                        </summary>
                        <div className="mt-1 space-y-1">
                          {Object.entries(entry.diff).map(
                            ([field, change]) => (
                              <div key={field} className="text-xs">
                                <span className="font-medium text-gray-600">
                                  {field}:
                                </span>{" "}
                                <span className="text-red-600 line-through">
                                  {String(change.old)}
                                </span>{" "}
                                <span className="text-green-600">
                                  {String(change.new)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
          >
            Load older events
          </Button>
        </div>
      )}
    </div>
  );
}

function AuditFeedSkeleton() {
  return (
    <div className="space-y-4 pl-10">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-lg bg-gray-100"
        />
      ))}
    </div>
  );
}
```

### 7.4 EnvironmentSwitcher

```tsx
// components/layout/environment-switcher.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useProject } from "@/providers/project-context";
import { ChevronDown, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EnvironmentSwitcher() {
  const { currentEnvironment, environments, switchEnvironment } =
    useProject();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () =>
        document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  if (!currentEnvironment) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <Circle
            className="h-2.5 w-2.5"
            fill={currentEnvironment.color}
            stroke={currentEnvironment.color}
          />
          <span className="font-medium">{currentEnvironment.name}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
          aria-activedescendant={currentEnvironment.id}
        >
          {environments.map((env) => (
            <button
              key={env.id}
              role="option"
              aria-selected={env.id === currentEnvironment.id}
              onClick={() => {
                switchEnvironment(env.id);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50",
                env.id === currentEnvironment.id && "bg-indigo-50"
              )}
            >
              <Circle
                className="h-2.5 w-2.5"
                fill={env.color}
                stroke={env.color}
              />
              <span
                className={cn(
                  "flex-1 text-left",
                  env.id === currentEnvironment.id && "font-medium"
                )}
              >
                {env.name}
              </span>
              {env.id === currentEnvironment.id && (
                <Check className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          ))}
        </div>
      )}

      {currentEnvironment.name.toLowerCase() === "production" && (
        <p className="mt-1 text-xs text-amber-600">
          You are viewing production. Changes are live immediately.
        </p>
      )}
    </div>
  );
}
```

> **Coming from Laravel/PHP**: This is similar to a tenant-switcher in a multi-tenant Laravel
> app. Changing the tenant updates `session('current_tenant_id')` and all subsequent queries
> are scoped. In React, switching the environment updates the Context, which causes every
> component reading `useProject()` to re-render with the new environment. TanStack Query keys
> include the environment ID, so switching environments automatically fetches fresh data.

### 7.5 APIKeyManager

```tsx
// components/settings/api-key-manager.tsx
"use client";

import { useState, useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useProject } from "@/providers/project-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// -- Types -------------------------------------------------------------------

interface APIKey {
  id: string;
  name: string;
  /** Only returned on creation, never again. */
  key?: string;
  /** First 8 chars + masked remainder: "fl_live_abc1****" */
  maskedKey: string;
  type: "server" | "client";
  lastUsedAt: string | null;
  createdAt: string;
  createdBy: string;
}

// -- Component ---------------------------------------------------------------

export function APIKeyManager() {
  const { currentProject, currentEnvironment } = useProject();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState<"server" | "client">(
    "server"
  );
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<APIKey | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // -- Query --

  const queryKey = [
    "api-keys",
    currentProject?.id,
    currentEnvironment?.id,
  ] as const;

  const { data: keys = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<APIKey[]> => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/api-keys`
      );
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json();
    },
    enabled: !!currentProject && !!currentEnvironment,
  });

  // -- Create mutation --

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      type,
    }: {
      name: string;
      type: "server" | "client";
    }) => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/api-keys`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type }),
        }
      );
      if (!res.ok) throw new Error("Failed to create API key");
      return res.json() as Promise<APIKey>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      setCreatedKey(data.key ?? null);
      setNewKeyName("");
    },
  });

  // -- Revoke mutation --

  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await fetch(
        `/api/projects/${currentProject!.id}/environments/${currentEnvironment!.id}/api-keys/${keyId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to revoke API key");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setRevokeTarget(null);
    },
  });

  // -- Copy to clipboard --

  const copyToClipboard = useCallback(
    async (text: string, id: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-gray-500">
            Manage API keys for the{" "}
            <strong>{currentEnvironment?.name}</strong> environment.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Key
        </Button>
      </div>

      {/* Key list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
          No API keys yet. Create one to start evaluating flags.
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {keys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="flex items-center justify-between p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{apiKey.name}</span>
                  <Badge
                    variant={
                      apiKey.type === "server" ? "neutral" : "success"
                    }
                  >
                    {apiKey.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-gray-500">
                    {apiKey.maskedKey}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(apiKey.maskedKey, apiKey.id)
                    }
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy masked key"
                  >
                    {copiedId === apiKey.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Created{" "}
                  {formatDistanceToNow(new Date(apiKey.createdAt), {
                    addSuffix: true,
                  })}
                  {apiKey.lastUsedAt && (
                    <>
                      {" "}
                      -- last used{" "}
                      {formatDistanceToNow(
                        new Date(apiKey.lastUsedAt),
                        { addSuffix: true }
                      )}
                    </>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRevokeTarget(apiKey)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreatedKey(null);
          setNewKeyName("");
        }}
        title={createdKey ? "API Key Created" : "Create API Key"}
      >
        {createdKey ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Copy this key now. It will{" "}
                  <strong>never be shown again</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-900 p-3">
              <code className="flex-1 break-all text-sm text-green-400">
                {createdKey}
              </code>
              <button
                onClick={() => copyToClipboard(createdKey, "new-key")}
                className="shrink-0 rounded p-1 text-gray-400 hover:text-white"
              >
                {copiedId === "new-key" ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowCreateModal(false);
                setCreatedKey(null);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate({
                name: newKeyName,
                type: newKeyType,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production Backend"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={newKeyType}
                onChange={(e) =>
                  setNewKeyType(
                    e.target.value as "server" | "client"
                  )
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="server">
                  Server-side (secret -- never expose to browser)
                </option>
                <option value="client">
                  Client-side (safe for frontend SDKs)
                </option>
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createMutation.isPending}
                disabled={!newKeyName.trim()}
              >
                Create
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Revoke Confirmation Modal */}
      <Modal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke API Key"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to revoke{" "}
            <strong>{revokeTarget?.name}</strong>? Any applications
            using this key will immediately lose access. This cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setRevokeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={revokeMutation.isPending}
              onClick={() =>
                revokeTarget &&
                revokeMutation.mutate(revokeTarget.id)
              }
            >
              Revoke Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

---

## Quick Reference: Laravel to React Mental Model

| Laravel / PHP Concept                | React / Next.js Equivalent                                            |
|--------------------------------------|-----------------------------------------------------------------------|
| Blade templates                      | JSX (Server Components for static, Client Components for interactive) |
| `@yield('content')` / `@section`     | `{children}` prop in layout components                                |
| Blade components (`<x-button>`)      | React components (`<Button>`)                                         |
| Livewire component state             | `useState` / `useReducer`                                             |
| Livewire `wire:model`                | Controlled inputs (`value` + `onChange`)                               |
| `session('key')`                     | React Context or URL search params                                    |
| FormRequest validation               | Zod schemas with React Hook Form                                      |
| `$request->validate([...])`          | `zodResolver(schema)` passed to `useForm`                             |
| Eloquent models / Repositories       | TanStack Query hooks (`useQuery`, `useMutation`)                      |
| Middleware                           | Next.js middleware (`middleware.ts`) or layout-level auth checks       |
| Service container / DI               | React Context + custom hooks                                          |
| Queues / Jobs                        | Server-side only; React consumes results via API/SSE                  |
| Broadcasting (Pusher/WebSocket)      | SSE or WebSocket via custom `useSSE` hook                             |
| `Cache::remember()`                  | `useMemo` (in-component) or TanStack Query cache (HTTP)               |
| Route model binding                  | `params` in page components + Prisma lookup                           |
| `php artisan tinker`                 | Browser DevTools console + React DevTools + TanStack Query DevTools   |
| Laravel Mix / Vite                   | Next.js built-in bundler (Turbopack/Webpack)                          |
| `@error('field')` / `$errors`        | `formState.errors` from React Hook Form                               |
| `abort(404)`                         | `notFound()` from `next/navigation`                                   |
| `try/catch` in Handler               | Error Boundaries (class components)                                   |
| Blade `@include`                     | Component composition -- import and render child components            |
| Blade `@props`                       | TypeScript interface for component props                              |

---

## Summary

This document covered the React architecture for the Crivline dashboard:

- **Server vs Client Components**: Use server components for data loading and static layout;
  use client components for anything interactive. Respect the serialization boundary.
- **Context**: ProjectProvider holds the current project and environment. All data fetching
  hooks read from this context to scope their queries.
- **Custom Hooks**: `useFlags`, `useAuditLog`, `useSSE`, and `useProject` encapsulate all
  data access logic. Components stay thin and focused on rendering.
- **Forms**: React Hook Form + Zod handles all form state and validation. The pattern mirrors
  Laravel FormRequest validation but runs client-side.
- **Data Fetching**: TanStack Query manages all client-side data with caching, background
  refetching, and optimistic updates. Server Components fetch initial data directly from Prisma.
- **Real-Time**: SSE streams push flag changes and audit events. The `useSSE` hook handles
  reconnection with exponential backoff. SSE events patch the TanStack Query cache directly.
- **Performance**: Memo list items, not forms. Use dynamic imports for heavy components.
  Profile before optimizing.
- **Error Handling**: Error boundaries at layout and widget level. Suspense boundaries for
  streaming. Skeletons for content, spinners for actions.

Each pattern exists to solve a specific problem in the Crivline dashboard. Do not adopt
patterns because they are "best practices" -- adopt them when you hit the problem they solve.
