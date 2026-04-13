'use client';

import { formatBytes } from '@/lib/utils';
import type { RushFile } from '@/lib/types.js';

export default function FilePreview({ file, token }: { file: RushFile; token: string }) {
  const { mime_type, name, size, updated_at } = file;

  const isImage = mime_type.startsWith('image/');
  const isVideo = mime_type.startsWith('video/');
  const isAudio = mime_type.startsWith('audio/');

  return (
    <div className="w-full max-w-md mx-auto bg-[#141414] border border-[#262626] rounded-xl p-8 space-y-6 shadow-xl">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 flex items-center justify-center bg-[#1a1a1a] border border-[#262626] rounded-2xl text-4xl">
          {isImage ? '🖼️' : isVideo ? '🎬' : isAudio ? '🎵' : '📄'}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-[#fafaf5] break-all">{name}</h3>
          <p className="text-sm text-[#a3a3a0]">
            {formatBytes(size || 0)} • {mime_type.split('/')[1]?.toUpperCase() || 'File'}
          </p>
        </div>

        <div className="text-xs text-[#a3a3a0]">
          Uploaded {new Date(updated_at || Date.now()).toLocaleDateString()}
        </div>
      </div>

      <div className="pt-4">
        {isImage && (
          <img
            src={`/api/files/${file.id}`}
            alt={name}
            className="w-full h-auto rounded-lg border border-[#262626] mb-4"
          />
        )}
        {isVideo && (
          <video controls className="w-full rounded-lg border border-[#262626] mb-4">
            <source src={`/api/files/${file.id}`} type={mime_type} />
          </video>
        )}
        {isAudio && (
          <audio controls className="w-full mb-4">
            <source src={`/api/files/${file.id}`} type={mime_type} />
          </audio>
        )}

        <a
          href={`/api/shares/${token}/download`}
          download
          className="flex items-center justify-center w-full py-3 bg-[#fafaf5] hover:bg-[#e5e5e5] text-[#0a0a0a] font-bold rounded-lg transition-colors"
        >
          Download File
        </a>
      </div>
    </div>
  );
}
