'use client';

import { useRef, useState, DragEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UploadManager, RushFile } from '@/lib/upload-manager';

interface UploadZoneProps {
  folderId?: number;
  onUploadComplete: (file: RushFile) => void;
}

export function UploadZone({ folderId, onUploadComplete }: UploadZoneProps) {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && token) {
      handleFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && token) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    const manager = new UploadManager(token ?? '', window.location.origin);
    
    for (const file of Array.from(files)) {
      try {
        const uploadedFile = await manager.upload(file, folderId, (progress) => {
          // Progress updates are handled by the UploadProgress component 
          // via a global state or context if needed, but for this task 
          // we assume the parent manages the list of progresses.
          console.log(progress);
        });
        onUploadComplete(uploadedFile);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        relative cursor-pointer transition-all duration-200
        border-2 border-dashed rounded-xl p-12 text-center
        ${isDragging 
          ? 'border-[#d4a853] bg-[#141414]' 
          : 'border-[#262626] hover:border-[#d4a853]'
        }
      `}
    >
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className="flex flex-col items-center gap-4">
        <div className="text-[#d4a853]">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-[#fafaf5] font-medium">Click or drag files to upload</p>
          <p className="text-[#a3a3a0] text-sm">Support for multiple files</p>
        </div>
      </div>
    </div>
  );
}
