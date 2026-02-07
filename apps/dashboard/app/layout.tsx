import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Flagline',
    template: '%s | Flagline',
  },
  description: 'Feature flags for small teams and indie hackers',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-gray-100">{children}</body>
    </html>
  );
}
