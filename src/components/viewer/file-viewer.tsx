'use client';

import React, { Suspense, lazy } from 'react';
import { FileInfo } from './file-info';
import { DownloadButton } from './download-button';
import { ShareDialog } from './share-dialog';

const ImagePreview = lazy(() => import('./image-preview'));
const VideoPreview = lazy(() => import('./video-preview'));
const TextPreview = lazy(() => import('./text-preview'));
const PdfPreview = lazy(() => import('./pdf-preview'));

interface FileViewerProps {
  file: {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    url: string;
    downloadUrl: string;
    createdAt: string;
    modifiedAt: string;
    owner: string;
  };
}

export function FileViewer({ file }: FileViewerProps) {
  const renderPreview = () => {
    if (file.mimeType.startsWith('image/')) {
      return <ImagePreview url={file.url} />;
    } else if (file.mimeType.startsWith('video/')) {
      return <VideoPreview url={file.url} />;
    } else if (file.mimeType === 'application/pdf') {
      return <PdfPreview url={file.url} />;
    } else if (file.mimeType.startsWith('text/') || 
               file.mimeType === 'application/json' || 
               file.mimeType === 'application/javascript' ||
               file.mimeType === 'text/plain') {
      return <TextPreview url={file.url} />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <div className="text-6xl mb-4">📄</div>
        <p>Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-100">
      <main className="flex-1 flex flex-col relative overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 flex items-center justify-center p-4">
          <Suspense fallback={<div className="text-gray-400">Loading preview...</div>}>
            {renderPreview()}
          </Suspense>
        </div>
      </main>

      <aside className="w-[320px] border-l bg-white p-6 overflow-y-auto">
        <FileInfo file={file} />
        <div className="mt-6 space-y-3">
          <ShareDialog fileId={file.id} />
          <DownloadButton url={file.downloadUrl} filename={file.name} />
        </div>
      </aside>
    </div>
  );
}
