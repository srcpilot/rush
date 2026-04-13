'use client';

import { UploadProgress } from '@/lib/upload-manager';

interface UploadProgressProps {
  progresses: UploadProgress[];
}

export function UploadProgress({ progresses }: UploadProgressProps) {
  if (progresses.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 flex flex-col gap-2 z-50">
      {progresses.map((progress, index) => (
        <div 
          key={`${progress.fileName}-${index}`}
          className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 shadow-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#fafaf5] text-sm font-medium truncate max-w-[180px]">
              {progress.fileName}
            </span>
            <span className={`text-xs ${
              progress.status === 'complete' ? 'text-[#d4a853]' : 
              progress.status === 'error' ? 'text-red-500' : 'text-[#a3a3a0]'
            }`}>
              {progress.status === 'uploading' ? `${progress.percent}%` : 
               progress.status === 'complete' ? 'Done' : 'Error'}
            </span>
          </div>
          
          <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                progress.status === 'error' ? 'bg-red-500' : 'bg-[#d4a853]'
              }`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
