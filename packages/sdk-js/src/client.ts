import type { FlaglineConfig, FlaglineUser, FlagValue, Unsubscribe } from './types';

export class FlaglineClient {
  private _config: FlaglineConfig;
  private cache: Map<string, FlagValue> = new Map();
  private ready = false;

  constructor(config: FlaglineConfig) {
    this._config = config;
  }

  async initialize(): Promise<void> {
    // TODO: fetch flags from API, open SSE connection
    this.ready = true;
  }

  getFlag<T extends FlagValue>(key: string, defaultValue: T): T {
    const value = this.cache.get(key);
    if (value === undefined) {
      return defaultValue;
    }
    return value as T;
  }

  getAllFlags(): Record<string, FlagValue> {
    return Object.fromEntries(this.cache);
  }

  onFlagChange(_key: string, _callback: (value: FlagValue) => void): Unsubscribe {
    // TODO: implement event subscription
    return () => {};
  }

  async identify(_user: FlaglineUser): Promise<void> {
    // TODO: re-evaluate flags with new user context
  }

  reset(): void {
    this.cache.clear();
  }

  isReady(): boolean {
    return this.ready;
  }

  destroy(): void {
    // TODO: close SSE connection, clear timers
    this.cache.clear();
    this.ready = false;
  }
}
