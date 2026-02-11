export type FlagValue = boolean | string | number | Record<string, unknown>;

export interface CrivlineUser {
  id: string;
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CrivlineConfig {
  apiKey: string;
  baseUrl?: string;
  user?: CrivlineUser;
  enableStreaming?: boolean;
  refreshInterval?: number;
  defaultValues?: Record<string, FlagValue>;
  onError?: (error: Error) => void;
}

export type Unsubscribe = () => void;
