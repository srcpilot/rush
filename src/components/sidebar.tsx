"use client";

import React from "react";
import { Folder, Files, Clock, Share2, Trash2, User } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const menuItems = [
    { icon: <Files size={20} />, label: "All Files", href: "/dashboard" },
    { icon: <Clock size={20} />, label: "Recent", href: "#" },
    { icon: <Share2 size={20} />, label: "Shared", href: "#" },
    { icon: <Trash2 size={20} />, label: "Trash", href: "#" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[240px] fixed h-full bg-[#0a0a0a] border-r border-[#2a2a2a]">
      <div className="p-6">
        <h1 className="text-[#d4a843] text-xl font-bold tracking-tighter">RUSH</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-2 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Files
        </p>
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-2 py-2 text-sm text-gray-400 hover:text-[#d4a843] hover:bg-[#1a1a1a] rounded-md transition-all"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 space-y-4">
        {/* Storage Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Storage</span>
            <span>85%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div className="h-full bg-[#d4a843] w-[85%]"></div>
          </div>
          <p className="text-[10px] text-gray-600">8.5 GB of 10 GB used</p>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3 px-2 py-3 border-t border-[#2a2a2a]">
          <div className="w-8 h-8 rounded-full bg-[#d4a843]/20 flex items-center justify-center text-[#d4a843]">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[#f5f0e8]">Alex Rivera</p>
            <p className="text-xs text-gray-500 truncate">alex@rush.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
