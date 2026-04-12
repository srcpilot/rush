import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-white">
            RUSH<span className="text-amber-500">.</span>
          </h1>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
