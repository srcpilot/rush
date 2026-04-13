'use client';

import { UploadProgress } from '@/lib/upload-manager';

interface UploadProgressProps {
  progresses: UploadProgress[];
}

export function UploadProgressList({ progresses }: UploadProgressProps) {
  if (progresses.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 flex flex-col gap-2 z-50">
      {progresses.map((p, idx) => (
        <div 
          key={`${p.fileName}-${idx}`}
          className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 shadow-xl"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#fafaf5] text-sm font-medium truncate max-w-[180px]">
              {p.fileName}
            </span>
            <span className={`text-[10px] uppercase font-bold ${
              p.status === 'complete' ? 'text-[#d4a853]' : 
              p.status === 'error' ? 'text-red-500' : 'text-[#a3a3a0]'
            }`}>
              {p.status}
            </span>
          </div>
          
          <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#d4a853] h-full transition-all duration-300 ease-out"
              style={{ width: `${p.percent}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-1.5">
            <span className="text-[#a3a3a0] text-[10px]">
              {p.percent}%
            </span>
            <span className="text-[#a3a3a0] text-[10px]">
              {Math.round(p.loaded / 1024 / 1024)}MB / {Math.round(p.total / 1024 / 1024)}MB
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
