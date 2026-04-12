"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils.js';
import { 
  FileText, 
  Users, 
  Trash2, 
  Search, 
  Menu, 
  X,
  HardDrive
} from 'lucide-react';

const navItems = [
  { name: 'Files', href: '/files', icon: FileText },
  { name: 'Shared', href: '/shared', icon: Users },
  { name: 'Trash', href: '/trash', icon: Trash2 },
  { name: 'Search', href: '/search', icon: Search },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 text-text-primary bg-bg-surface border border-border rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full w-60 bg-bg-surface border-r border-border z-40 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 bg-accent-gold rounded flex items-center justify-center">
              <span className="text-bg-primary font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Rush</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive 
                      ? "bg-accent-gold/10 text-accent-gold" 
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Storage Meter */}
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-text-secondary mb-2 px-2">
              <HardDrive size={14} />
              <span>75% of 10GB used</span>
            </div>
            <div className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-accent-gold w-3/4" />
            </div>
          </div>

          {/* User Menu Placeholder */}
          <div className="mt-4 pt-4 border-t border-border px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">User Name</p>
                <p className="text-xs text-text-secondary truncate">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
