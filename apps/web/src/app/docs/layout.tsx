import { MobileSidebar } from '@/components/docs/mobile-sidebar';
import { DocsNavbar } from '@/components/docs/navbar';
import { DocsSidebar } from '@/components/docs/sidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <DocsNavbar />
      <MobileSidebar />

      <div className="mx-auto max-w-[90rem] px-6 lg:px-8 pt-14 flex">
        <DocsSidebar />
        <main className="flex-1 min-w-0 py-8 lg:pl-8">{children}</main>
      </div>
    </div>
  );
}
