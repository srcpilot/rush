import React, { useCallback, useRef, useState } from 'react';
import { useUploadQueue } from '@/hooks/use-upload-queue';
import { DropZone } from './drop-zone';
import { UploadQueue } from './upload-queue';

interface UploadPageProps {}

export function UploadPage({}: UploadPageProps) {
  const { addFiles } = useUploadQueue();

  const handleFilesDropped = useCallback((files: File[]) => {
    addFiles(files);
  }, [addFiles]);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-[#fafaf5]">Upload Files</h1>
        <p className="text-[#a3a3a0]">Upload your assets to the cloud.</p>
      </header>

      <DropZone onFilesDropped={handleFilesDropped} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#fafaf5]">Upload Queue</h2>
        <UploadQueue />
      </div>
    </div>
  );
}
