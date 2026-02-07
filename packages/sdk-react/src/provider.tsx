'use client';

import { FlaglineClient } from '@flagline/js';
import type { FlaglineConfig } from '@flagline/js';
import { createContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export const FlaglineContext = createContext<FlaglineClient | null>(null);

interface FlaglineProviderProps {
  config: FlaglineConfig;
  children: ReactNode;
}

export function FlaglineProvider({ config, children }: FlaglineProviderProps) {
  const clientRef = useRef<FlaglineClient | null>(null);
  const [, setReady] = useState(false);

  useEffect(() => {
    const client = new FlaglineClient(config);
    clientRef.current = client;

    client.initialize().then(() => {
      setReady(true);
    });

    return () => {
      client.destroy();
    };
  }, [config]);

  return (
    <FlaglineContext.Provider value={clientRef.current}>{children}</FlaglineContext.Provider>
  );
}
