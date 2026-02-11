import { getCurrentUser } from '../../lib/auth';

import { Sidebar } from './_components/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
