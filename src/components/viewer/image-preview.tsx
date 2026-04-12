'use client';

import React from 'react';

interface ImagePreviewProps {
  url: string;
}

export function ImagePreview({ url }: ImagePreviewProps) {
  return (
    <div className="flex items-center justify-center w-full h-full overflow-auto">
      <img 
        src={url} 
        alt="Preview" 
        className="max-w-full max-h-full object-contain shadow-lg"
      />
    </div>
  );
}

export default ImagePreview;
