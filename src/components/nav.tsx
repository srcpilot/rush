import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Upload', href: '/upload' },
  { label: 'Search', href: '/search' },
];

const AUTH_ITEMS = [
  { label: 'Login', href: '/auth/login' },
  { label: 'Register', href: '/auth/register' },
];

export function Nav() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141414]">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold text-[#d4a853]">
          RUSH
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="text-[#a3a3a0] hover:text-[#fafaf5] transition-colors text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-[#fafaf5]">{user.name}</span>
                <span className="text-xs text-[#a3a3a0]">{user.email}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-[#d4a853] text-xs font-bold">
                {getInitials(user.name)}
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {AUTH_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
