export interface SidebarLink {
  label: string;
  href: string;
}

export interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

export const sidebarNav: SidebarSection[] = [
  {
    title: 'Getting Started',
    links: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Quick Start', href: '/docs/quick-start' },
      { label: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    title: 'SDK Reference',
    links: [
      { label: 'JavaScript SDK', href: '/docs/sdk/javascript' },
      { label: 'React SDK', href: '/docs/sdk/react' },
      { label: 'Node.js SDK', href: '/docs/sdk/node' },
    ],
  },
  {
    title: 'REST API',
    links: [
      { label: 'Authentication', href: '/docs/api/authentication' },
      { label: 'Flags', href: '/docs/api/flags' },
      { label: 'Environments', href: '/docs/api/environments' },
      { label: 'Evaluation', href: '/docs/api/evaluation' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { label: 'Percentage Rollouts', href: '/docs/guides/rollouts' },
      { label: 'Environment Targeting', href: '/docs/guides/environments' },
    ],
  },
];
