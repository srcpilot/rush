'use client';

import { RushFile } from '@/lib/types';
import { formatBytes } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FileCardProps {
  file: RushFile;
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
}

export function FileCard({ file, onDelete, onShare }: FileCardProps) {
  const getMimeTypeBadge = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'IMG';
    if (mimeType.startsWith('video/')) return 'VID';
    if (mimeType.startsWith('audio/')) return 'AUD';
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.includes('text/')) return 'TXT';
    return 'FILE';
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-lg p-4 hover:border-[#d4a853] transition-colors group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#262626] text-[#a3a3a0] uppercase">
              {getMimeTypeBadge(file.mime_type)}
            </span>
            <h3 className="text-[#fafaf5] font-medium truncate text-sm" title={file.name}>
              {file.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#a3a3a0]">
            <span>{formatBytes(file.size)}</span>
            <span>•</span>
            <span>{new Date(file.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#262626]">
        <a
          href={`/api/files/${file.id}/download`}
          className="p-2 text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
          title="Download"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </a>
        
        {onShare && (
          <button
            onClick={() => onShare(file.id)}
            className="p-2 text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
            title="Share"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="p-2 text-[#a3a3a0] hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
