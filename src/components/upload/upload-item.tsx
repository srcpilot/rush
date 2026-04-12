'use client';

import React from 'react';
import { ProgressBar } from './progress-bar';
import { UploadItem } from '@/hooks/use-upload';

interface UploadItemProps {
  item: UploadItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export function UploadItem({ item, onRemove, onRetry }: UploadItemProps) {
  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm border border-gray-100 mb-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 truncate">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
            {item.file.name.split('.').pop()?.toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
            <p className="text-xs text-gray-500">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {item.status === 'completed' && (
            <span className="text-[#4ade80] text-sm">✓</span>
          )}
          {item.status === 'error' && (
            <button 
              onClick={() => onRetry(item.id)}
              className="text-sm text-[#ef4444] hover:underline"
            >
              Retry
            </button>
          )}
          <button 
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      <ProgressBar progress={item.progress} status={item.status} />
      
      {item.status === 'error' && item.error && (
        <p className="text-xs text-[#ef4444]">{item.error}</p>
      )}
    </div>
  );
}
