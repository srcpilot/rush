'use client';

import React from 'react';

interface PdfPreviewProps {
  url: string;
}

export function PdfPreview({ url }: PdfPreviewProps) {
  return (
    <div className="w-full h-full overflow-hidden">
      <iframe 
        src={url} 
        className="w-full h-full border-none"
        title="PDF Preview"
      />
    </div >
  );
}

export default PdfPreview;
