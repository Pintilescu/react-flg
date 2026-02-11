import { Github, Mail, AtSign } from 'lucide-react';
import Link from 'next/link';

import { CrivlineLogo } from '@/components/logo';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'SDKs', href: '/docs/sdk/javascript' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'API Reference', href: '/docs/api/authentication' },
      { label: 'Community', href: '/community' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <CrivlineLogo className="h-7 w-7" />
              <span className="text-lg font-bold text-gray-900">Crivline</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              The professional choice for feature management. Build faster, release safer, and scale with confidence.
            </p>
            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              <Link href="https://github.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="mailto:hello@crivline.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Mail className="h-4 w-4" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                <AtSign className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-gray-900 mb-3">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Crivline Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
