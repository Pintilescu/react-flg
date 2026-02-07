'use client';
import { Home, Flag, FolderOpen, Clock, Settings, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathName = usePathname();
  return (
    <div className="flex h-screen bg-white text-gray-900">
      <nav className="w-16 lg:w-64 border-r border-gray-200 p-4">
        <Link
          href="/dashboard"
          className={
            pathName === '/dashboard'
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center lg:justify-start'
          }
        >
          <Home className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
        <Link
          href="/dashboard/projects"
          className={
            pathName.startsWith('/dashboard/projects')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center lg:justify-start'
          }
        >
          <FolderOpen className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Projects</span>
        </Link>
        <Link
          href="/dashboard/flags"
          className={
            pathName.startsWith('/dashboard/flags')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center lg:justify-start'
          }
        >
          <Flag className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Flags</span>
        </Link>
        <Link
          href="/dashboard/audit"
          className={
            pathName.startsWith('/dashboard/audit')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center lg:justify-start'
          }
        >
          <Clock className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Audit Log</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className={
            pathName.startsWith('/dashboard/settings')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center lg:justify-start'
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </Link>
        <Link
          href="/dashboard/billing"
          className={
            pathName.startsWith('/dashboard/billing')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 bg-gray-100 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 justify-center lg:justify-start'
          }
        >
          <CreditCard className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Billing</span>
        </Link>
      </nav>
    </div>
  );
}
