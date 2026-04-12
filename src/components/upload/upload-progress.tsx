import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils.js';
import type { RushFile } from '@/lib/types.js';

interface UploadProgressProps {
  uploads: {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
    speed?: string;
  }[];
  onCancel: (file: File) => void;
}

export function UploadProgress({ uploads, onCancel }: UploadProgressProps) {
  if (uploads.length === 0) return null;

  return (
    <div className="w-full space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Queue</h3>
      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                  {upload.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {upload.status === 'uploading' ? `${upload.progress}%` : upload.status}
                    {upload.speed && ` • ${upload.speed}`}
                  </p>
                </div>
              </div>
              
              {upload.status === 'uploading' && (
                <button
                  onClick={() => onCancel(upload.file)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Cancel upload"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 ease-out",
                  upload.status === 'completed' ? "bg-green-500" : 
                  upload.status === 'error' ? "bg-red-500" : 
                  upload.status === 'cancelled' ? "bg-gray-400" : "bg-yellow-500"
                )}
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
