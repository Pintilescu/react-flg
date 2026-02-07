'use client';

import type { FlaglineClient, FlagValue } from '@flagline/js';
import { useContext } from 'react';

import { FlaglineContext } from './provider';

export function useFlagline(): FlaglineClient {
  const client = useContext(FlaglineContext);
  if (!client) {
    throw new Error('useFlagline must be used within a <FlaglineProvider>');
  }
  return client;
}

export function useFlag<T extends FlagValue>(key: string, defaultValue: T): T {
  const client = useFlagline();
  return client.getFlag<T>(key, defaultValue);
}

export function useFlags(): Record<string, FlagValue> {
  const client = useFlagline();
  return client.getAllFlags();
}
