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
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-[#d4a853]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-[#f5f0e8] font-medium truncate">{folder.name}</p>
            <p className="text-[#a3a3a0] text-xs">
              {new Date(folder.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
