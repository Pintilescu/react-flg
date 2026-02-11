'use client';

import type { CrivlineClient, FlagValue } from '@crivline/js';
import { useContext } from 'react';

import { CrivlineContext } from './provider';

export function useCrivline(): CrivlineClient {
  const client = useContext(CrivlineContext);
  if (!client) {
    throw new Error('useCrivline must be used within a <CrivlineProvider>');
  }
  return client;
}

export function useFlag<T extends FlagValue>(key: string, defaultValue: T): T {
  const client = useCrivline();
  return client.getFlag<T>(key, defaultValue);
}

export function useFlags(): Record<string, FlagValue> {
  const client = useCrivline();
  return client.getAllFlags();
}
