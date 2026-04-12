import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Providers } from '@/components/providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-text-primary antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-60 p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
