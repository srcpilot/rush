import React, { useState, useEffect, useCallback } from 'react';
import { UploadItemState } from '@/lib/types.js';

interface UploadItemProps {
  item: UploadItemState;
  onRetry?: (id: string) => void;
}

export function UploadItem({ item, onRetry }: UploadItemProps) {
  const progress = (item.progress / 100) * 100;

  return (
    <div className="p-4 bg-[#1a1a1a] border border-[#262626] rounded-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded bg-[#262626] flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#a3a3a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-[#fafaf5] truncate">{item.file.name}</p>
            <p className="text-xs text-[#a3a3a0]">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.status === 'complete' && (
            <span className="text-[#d4a853] text-xs font-medium">Completed</span>
          )}
          {item.status === 'error' && (
            <button 
              onClick={() => onRetry?.(item.id)}
              className="text-xs font-medium text-red-400 hover:text-red-300"
            >
              Retry
            </button>
          )}
          {item.status === 'uploading' && (
            <span className="text-xs text-[#a3a3a0]">{Math.round(item.progress)}%</span>
          )}
        </div>
      </div>

      <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            item.status === 'error' ? 'bg-red-500' : 
            item.status === 'complete' ? 'bg-[#d4a853]' : 'bg-[#d4a853]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {item.error && (
        <p className="text-xs text-red-400">{item.error}</p>
      )}
    </div>
  );
}
