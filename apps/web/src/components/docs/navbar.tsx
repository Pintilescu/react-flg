import { Search } from 'lucide-react';
import Link from 'next/link';

import { CrivlineLogo } from '@/components/logo';

export function DocsNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-[90rem] px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <CrivlineLogo className="h-5 w-5" />
            <span className="font-bold text-gray-900">Crivline</span>
          </Link>
          <span className="text-sm text-gray-300">/</span>
          <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Docs
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 cursor-pointer hover:border-gray-300 transition-colors">
            <Search className="w-3.5 h-3.5" />
            <span>Search docs...</span>
            <kbd className="ml-4 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
              Ctrl+K
            </kbd>
          </div>
          <Link
            href="/signup"
            className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
