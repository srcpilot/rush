'use client';

import React from 'react';

interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <video 
        src={url} 
        controls 
        className="max-w-full max-h-full shadow-lg"
      />
    </div >
  );
}

export default VideoPreview;
