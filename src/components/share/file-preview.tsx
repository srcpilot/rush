import React from 'react';
import type { RushFile } from '@/lib/types.js';

interface FilePreviewProps {
  file: RushFile;
}

export default function FilePreview({ file }: FilePreviewProps) {
  const mimeType = file.mime_type;
  const name = file.name ?? 'file';

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
