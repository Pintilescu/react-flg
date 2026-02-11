'use client';

import { CrivlineClient } from '@crivline/js';
import type { CrivlineConfig } from '@crivline/js';
import { createContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export const CrivlineContext = createContext<CrivlineClient | null>(null);

interface CrivlineProviderProps {
  config: CrivlineConfig;
  children: ReactNode;
}

export function CrivlineProvider({ config, children }: CrivlineProviderProps) {
  const clientRef = useRef<CrivlineClient | null>(null);
  const [, setReady] = useState(false);

  useEffect(() => {
    const client = new CrivlineClient(config);
    clientRef.current = client;

    client.initialize().then(() => {
      setReady(true);
    });

    return () => {
      client.destroy();
    };
  }, [config]);

  return (
    <CrivlineContext.Provider value={clientRef.current}>{children}</CrivlineContext.Provider>
  );
}
