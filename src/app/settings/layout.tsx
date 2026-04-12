import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#f5f5f0]">
      <aside className="w-[200px] border-r border-[#262626] p-6 hidden md:block">
        <nav className="space-y-4">
          <a href="/settings" className="block text-sm font-medium hover:text-[#d4af37] transition-colors">
            Account
          </a>
          <a href="/settings/storage" className="block text-sm font-medium hover:text-[#d4af37] transition-colors">
            Storage
          </a>
          <a href="/settings/danger-zone" className="block text-sm font-medium hover:text-[#d4af37] transition-colors">
            Danger Zone
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
