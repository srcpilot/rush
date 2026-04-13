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
      className={cn(
        "bg-[#141414] border border-[#262626] rounded-lg p-4 hover:border-[#d4a853] cursor-pointer transition-colors group",
      )}
    >
      <div className="flex items-center gap-3">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d4a853"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#fafaf5] font-medium truncate text-sm" title={folder.name}>
            {folder.name}
          </h3>
          <p className="text-xs text-[#a3a3a0] mt-0.5">
            {new Date(folder.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
