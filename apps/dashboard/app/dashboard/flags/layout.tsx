export default function FlagsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
