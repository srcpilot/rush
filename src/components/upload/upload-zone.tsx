import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils.js';

export function UploadZone({ onFilesSelected }: { onFilesSelected?: (files: File[]) => void }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected?.(files);
    }
  }, [onFilesSelected]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onFilesSelected?.(files);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200",
          isDragActive 
            ? "border-yellow-500 bg-yellow-50/50" 
            : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-12 h-12 mb-4 text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Any file type supported
          </p>
        </div>
      </div>
    </div>
  );
}
