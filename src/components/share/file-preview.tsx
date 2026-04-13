'use client';

import { formatBytes } from '@/lib/utils';
import type { RushFile } from '@/lib/types.js';

interface FilePreviewProps {
  share: any; // Using any for now as Share type might be complex, but ideally use Share from types
  file: RushFile;
  token: string;
}

export default function FilePreview({ file, token }: { file: RushFile, token: string }) {
  const { mimeType, name, size, updatedAt } = file;

  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');

  return (
    <div className="w-full max-w-md mx-auto bg-[#141414] border border-[#262626] rounded-xl p-8 space-y-6 shadow-xl">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 flex items-center justify-center bg-[#1a1a1a] border border-[#262626] rounded-2xl text-4xl">
          {isImage ? '🖼️' : isVideo ? '🎬' : isAudio ? '🎵' : '📄'}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-[#fafaf5] break-all">{name}</h3>
          <p className="text-sm text-[#a3a3a0]">
            {formatBytes(size || 0)} • {mimeType.split('/')[1]?.toUpperCase() || 'File'}
          </p>
        </div>

        <div className="text-xs text-[#a3a3a0]">
          Uploaded {new Date(updatedAt || Date.now()).toLocaleDateString()}
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
          <video 
            controls 
            className="w-full rounded-lg border border-[#262626] mb-4"
          >
            <source src={`/api/files/${file.id}`} type={mimeType} />
          </video>
        )}
        {isAudio && (
          <audio 
            controls 
            className="w-full mb-4"
          >
            <source src={`/api/files/${file.id}`} type={mimeType} />
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

import React from 'react';
import type { RushFile } from '@/lib/types.js';

interface FilePreviewProps {
  file: RushFile;
}

export default function FilePreview({ file }: FilePreviewProps) {
  const { mimeType, name } = file;

  if (mimeType.startsWith('image/')) {
    return (
      <div className="flex items-center justify-center p-4 bg-[#1a1a1a]">
        <img 
          src={`/api/files/${file.id}`} 
          alt={name} 
          className="max-w-full max-h-[70vh] object-contain"
        />
      </div>
    );
  }

  if (mimeType.startsWith('video/')) {
    return (
      <div className="flex items-center justify-center p-4 bg-[#1a1a1a]">
        <video 
          controls 
          className="max-w-full max-h-[70vh]"
        >
          <source src={`/api/files/${file.id}`} type={mimeType} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (mimeType.startsWith('audio/')) {
    return (
      <div className="flex items-center justify-center p-8 bg-[#1a1a1a]">
        <audio 
          controls 
          className="w-full max-w-md"
        >
          <source src={`/api/files/${file.id}`} type={mimeType} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-20 bg-[#1a1a1a] text-[#a3a3a0]">
      <div className="w-16 h-16 mb-4 flex items-center justify-center bg-[#262626] rounded-lg">
        <span className="text-2xl">📄</span>
      </div>
      <p className="text-lg font-medium text-[#fafaf5]">{name}</p>
      <p className="text-sm">{mimeType}</p>
    </div>
  );
}
