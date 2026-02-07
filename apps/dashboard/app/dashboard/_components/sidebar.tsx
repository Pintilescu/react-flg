'use client';
import { Home, Flag, FolderOpen, Clock, Settings, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathName = usePathname();
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <nav className="w-16 lg:w-64 border-r border-gray-800 p-4">
        <Link
          href="/dashboard"
          className={
            pathName === '/dashboard'
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 justify-center lg:justify-start'
          }
        >
          <Home className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
        <Link
          href="/dashboard/projects"
          className={
            pathName.startsWith('/dashboard/projects')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 justify-center lg:justify-start'
          }
        >
          <FolderOpen className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Projects</span>
        </Link>
        <Link
          href="/dashboard/flags"
          className={
            pathName.startsWith('/dashboard/flags')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 justify-center lg:justify-start'
          }
        >
          <Flag className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Flags</span>
        </Link>
        <Link
          href="/dashboard/audit"
          className={
            pathName.startsWith('/dashboard/audit')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 justify-center lg:justify-start'
          }
        >
          <Clock className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Audit Log</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className={
            pathName.startsWith('/dashboard/settings')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 justify-center lg:justify-start'
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </Link>
        <Link
          href="/dashboard/billing"
          className={
            pathName.startsWith('/dashboard/billing')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 justify-center lg:justify-start'
          }
        >
          <CreditCard className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Billing</span>
        </Link>
      </nav>
    </div>
  );
}
