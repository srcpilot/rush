'use client';

import { useRef, useState, DragEvent, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UploadManager } from '@/lib/upload-manager';
import { RushFile } from '@/lib/rush-file';

interface UploadZoneProps {
  folderId?: number;
  onUploadComplete: (file: RushFile) => void;
}

export function UploadZone({ folderId, onUploadComplete }: UploadZoneProps) {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // In a real app, the baseUrl would come from an env var or config
  const uploadManager = useRef<UploadManager | null>(null);

  const handleUpload = useCallback(async (files: File[]) => {
    if (!token) return;
    if (!uploadManager.current) {
      uploadManager.current = new UploadManager(token, window.location.origin);
    }

    for (const file of files) {
      try {
        const uploadedFile = await uploadManager.current.upload(file, folderId, (progress) => {
          console.log(`Upload progress for ${progress.fileName}: ${progress.percent}%`);
        });
        onUploadComplete(uploadedFile);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
  }, [token, folderId, onUploadComplete]);

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleUpload(files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={triggerFileInput}
      className={`
        relative cursor-pointer transition-all duration-200
        border-2 border-dashed rounded-xl p-12 text-center
        ${isDragging 
          ? 'border-[#d4a853] bg-[#141414]' 
          : 'border-[#262626] hover:border-[#d4a853] bg-[#0a0a0a]'
        }
      `}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={onFileSelect}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <svg className="w-6 h-6 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-[#fafaf5] font-medium">
            {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
          </p>
          <p className="text-[#a3a3a0] text-sm mt-1">
            Support for large files via multipart upload
          </p>
        </div>
      </div>
    </div>
  );
}
