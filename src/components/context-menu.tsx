"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils.js';

interface ContextMenuProps {
  target: { id: string; type: 'file' | 'folder'; x: number; y: number };
  onClose: () => void;
}

export default function ContextMenu({ target, onClose }: ContextMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (event.target as HTMLElement).closest('[data-context-menu]') === null
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  const menuItems = [
    { label: 'Download', action: () => console.log('Download', target.id) },
    { label: 'Share', action: () => console.log('Share', target.id) },
    { label: 'Move', action: () => console.log('Move', target.id) },
    { label: 'Trash', action: () => console.log('Trash', target.id), danger: true },
  ];

  return createPortal(
    <div
      data-context-menu
      className="fixed z-[9999] w-48 bg-[#1a1a1a] border border-[#262626] rounded-md shadow-xl py-1 overflow-hidden"
      style={{ top: target.y, left: target.x }}
    >
      {menuItems.map((item, idx) => (
        <button
          key={idx}
          onClick={() => {
            item.action();
            onClose();
          }}
          className={cn(
            "w-full text-left px-4 py-2 text-sm transition-colors",
            item.danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:bg-[#262626]"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
