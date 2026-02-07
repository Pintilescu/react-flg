export type FlagValue = boolean | string | number | Record<string, unknown>;

export interface FlaglineUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface FlaglineConfig {
  apiKey: string;
  baseUrl?: string;
  user?: FlaglineUser;
  enableStreaming?: boolean;
  refreshInterval?: number;
  defaultValues?: Record<string, FlagValue>;
  onError?: (error: Error) => void;
}

export type Unsubscribe = () => void;
