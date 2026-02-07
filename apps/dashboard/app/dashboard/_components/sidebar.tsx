'use client';
import { Home, Flag, FolderOpen, Clock, Settings, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathName = usePathname();
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <nav className="w-64 border-r border-gray-800 p-4">
        <Link
          href="/dashboard"
          className={
            pathName === '/dashboard'
              ? 'flex gap-3 rounded-lg px-3 py-2'
              : 'flex gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
          }
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/projects"
          className={
            pathName.startsWith('/dashboard/projects')
              ? 'flex gap-3 rounded-lg px-3 py-2'
              : 'flex gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
          }
        >
          <FolderOpen className="h-5 w-5" />
          Projects
        </Link>
        <Link
          href="/dashboard/flags"
          className={
            pathName.startsWith('/dashboard/flags')
              ? 'flex gap-3 rounded-lg px-3 py-2'
              : 'flex gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
          }
        >
          <Flag className="h-5 w-5" />
          Flags
        </Link>
        <Link
          href="/dashboard/audit"
          className={
            pathName.startsWith('/dashboard/audit')
              ? 'flex gap-3 rounded-lg px-3 py-2'
              : 'flex gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
          }
        >
          <Clock className="h-5 w-5" />
          Audit Log
        </Link>
        <Link
          href="/dashboard/settings"
          className={
            pathName.startsWith('/dashboard/settings')
              ? 'flex gap-3 rounded-lg px-3 py-2'
              : 'flex gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/dashboard/billing"
          className={
            pathName.startsWith('/dashboard/billing')
              ? 'flex gap-3 rounded-lg px-3 py-2'
              : 'flex gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
          }
        >
          <CreditCard className="h-5 w-5" />
          Billing
        </Link>
      </nav>
    </div>
  );
}
