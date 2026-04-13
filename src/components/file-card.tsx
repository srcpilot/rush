'use client';

import { RushFile } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FileCardProps {
  file: RushFile;
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
}

const getMimeTypeBadge = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('text/')) return 'TEXT';
  return 'FILE';
};

export function FileCard({ file, onDelete, onShare }: FileCardProps) {
  const mimeTypeBadge = getMimeTypeBadge(file.mimeType);

  return (
    <div className={cn(
      "bg-[#141414] border border-[#262626] rounded-lg p-4 hover:border-[#d4a853] transition-colors group",
    )}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#a3a3a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="overflow-hidden">
              <p className="text-[#f5f0e8] font-medium truncate">{file.name}</p>
              <p className="text-[#a3a3a0] text-xs">{formatBytes(file.size)} • {mimeTypeBadge}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#262626]">
          <a
            href={`/api/files/${file.id}/download`}
            className="flex-1 text-center text-xs py-1.5 rounded bg-[#1a1a1a] text-[#f5f0e8] hover:bg-[#262626] transition-colors"
          >
            Download
          </a>
          {onShare && (
            <button
              onClick={() => onShare(file.id)}
              className="flex-1 text-xs py-1.5 rounded bg-[#1a1a1a] text-[#f5f0e8] hover:bg-[#262626] transition-colors"
            >
              Share
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(file.id)}
              className="flex-1 text-xs py-1.5 rounded bg-[#1a1a1a] text-red-400 hover:bg-red-950/30 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
