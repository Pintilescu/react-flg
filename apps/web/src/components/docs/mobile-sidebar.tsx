'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { sidebarNav } from './sidebar-data';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-[60] p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 z-[80] w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-gray-900">Navigation</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-6">
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
            </nav>
          </div>
        </>
      )}
    </>
  );
}
