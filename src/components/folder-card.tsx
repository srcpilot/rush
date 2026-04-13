"use client";

import type { Folder } from "@/lib/types.js";
import { cn } from "@/lib/utils.js";

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
}

export default function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group bg-[#141414] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 cursor-pointer transition-all"
    >
      <div className="aspect-video bg-[#1a1a1a] rounded mb-3 flex items-center justify-center border border-[#262626]">
        <svg className="w-10 h-10 text-[#d4a853]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <div className="text-sm font-medium text-gray-200 truncate">{folder.name}</div>
      <div className="text-xs text-muted-foreground mt-1">{folder.name}</div>
    </div>
  );
}
