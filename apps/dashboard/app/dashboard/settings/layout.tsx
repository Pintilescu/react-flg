export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
