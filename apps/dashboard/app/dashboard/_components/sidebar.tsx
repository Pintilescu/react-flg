'use client';
import { LayoutDashboard, Tag, Globe, Users, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarProps = {
  user: {
    name: string | null;
    avatarUrl: string | null;
    role: string | null;
    email: string | null;
  };
};
export function Sidebar({ user }: SidebarProps) {
  const pathName = usePathname();

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-16 lg:w-64 shrink-0">
      <div className="flex items-center gap-3 px-4 py-6 justify-center lg:justify-start">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
          <Tag className="h-4 w-4 text-white" />
        </div>
        <div className="hidden lg:block">
          <p className="font-bold text-base leading-none">Crivline</p>
          <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">Enterprise</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <Link
          href="/dashboard"
          className={
            pathName === '/dashboard'
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-600 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 justify-center lg:justify-start'
          }
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
        <Link
          href="/dashboard/flags"
          className={
            pathName.startsWith('/dashboard/flags')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-600 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 justify-center lg:justify-start'
          }
        >
          <Tag className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Flags</span>
        </Link>
        <Link
          href="/dashboard/environments"
          className={
            pathName.startsWith('/dashboard/environments')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-600 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 justify-center lg:justify-start'
          }
        >
          <Globe className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Environments</span>
        </Link>
        <Link
          href="/dashboard/projects"
          className={
            pathName.startsWith('/dashboard/projects')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-600 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 justify-center lg:justify-start'
          }
        >
          <Users className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Projects</span>
        </Link>

        <div className="border-t border-gray-100 my-4" />

        <Link
          href="/dashboard/settings"
          className={
            pathName.startsWith('/dashboard/settings')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-600 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 justify-center lg:justify-start'
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Settings</span>
        </Link>
        <Link
          href="/dashboard/docs"
          className={
            pathName.startsWith('/dashboard/docs')
              ? 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-emerald-50 text-emerald-600 font-medium justify-center lg:justify-start'
              : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 justify-center lg:justify-start'
          }
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Documentation</span>
        </Link>
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 justify-center lg:justify-start">
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name ?? user.email}</p>{' '}
            <p className="text-xs text-gray-400 truncate">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
