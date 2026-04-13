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
        <div className="flex items-start gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#d4a853] border border-[#262626]">
            {getMimeTypeBadge(file.mime_type)}
          </div>
          <div className="min-w-0">
            <p className="text-[#fafaf5] font-medium truncate text-sm">{file.name}</p>
            <p className="text-[#a3a3a0] text-xs mt-1">
              {formatBytes(file.size)} • {new Date(file.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#262626] opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          href={`/api/files/${file.id}/download`}
          className="p-2 text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
          title="Download"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
        
        {onShare && (
          <button
            onClick={() => onShare(file.id)}
            className="p-2 text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
            title="Share"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="p-2 text-[#a3a3a0] hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
