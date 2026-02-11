'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarNav } from './sidebar-data';

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r border-gray-200 py-8 pr-6">
      <nav className="sticky top-22 space-y-6">
        {sidebarNav.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        isActive
                          ? 'text-emerald-700 bg-emerald-50 font-medium'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="pt-4 border-t border-gray-200">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            v1.0.0
          </span>
        </div>
      </nav>
    </aside>
  );
}
