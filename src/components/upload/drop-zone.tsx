import React, { useCallback, useRef, useState } from 'react';
import { useUploadQueue } from '@/hooks/use-upload-queue';

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
}

export function DropZone({ onFilesDropped }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesDropped(Array.from(e.target.files));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      className={`
        relative cursor-pointer border-2 border-dashed rounded-xl p-12
        transition-all duration-200 flex flex-col items-center justify-center text-center
        ${isDragging 
          ? 'border-[#d4a853] bg-[#d4a853]/10' 
          : 'border-[#262626] bg-[#141414] hover:border-[#a3a3a0]'
        }
      `}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
      />
      
      <div className="mb-4 text-[#d4a853]">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <p className="text-lg font-medium text-[#fafaf5]">
        Click to upload or drag and drop
      </p>
      <p className="text-sm text-[#a3a3a0] mt-1">
        Any file up to 500MB
      </p>
    </div>
  );
}
