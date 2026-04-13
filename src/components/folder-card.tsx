'use client';

import { Folder } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FolderCardProps {
  folder: Folder;
  onClick: (id: number) => void;
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <div
      onClick={() => onClick(folder.id)}
      className="bg-[#141414] border border-[#262626] rounded-lg p-4 hover:border-[#d4a853] cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-[#d4a853]">
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[#fafaf5] font-medium truncate text-sm">{folder.name}</p>
          <p className="text-[#a3a3a0] text-xs mt-1">
            {new Date(folder.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
