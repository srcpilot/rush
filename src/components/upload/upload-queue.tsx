'use client';

import React, { useState } from 'react';
import { useUploadHook } from '@/hooks/use-upload';
import { UploadItem } from './upload-item';

export function UploadQueue() {
  const { queue, removeItem, retryItem } = useUploadHook();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasCompleted = queue.every(item => item.status === 'completed');
  const hasErrors = queue.some(item => item.status === 'error');
  const isUploading = queue.some(item => item.status === 'uploading');

  if (queue.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[360px] z-50 flex flex-col items-end transition-all duration-300">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-[#d4a843] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#c2963a] transition-colors flex items-center space-x-2"
        >
          <span className="text-sm font-medium">Uploads</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
            {queue.length}
          </span>
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
            <h3 className="font-semibold text-gray-800">Upload Queue</h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Collapse
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {queue.map((item) => (
              <UploadItem 
                key={item.id} 
                item={item} 
                onRemove={removeItem} 
                onRetry={retryItem} 
              />
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
             <span className="text-xs text-gray-500">
               {isUploading ? 'Uploading...' : hasCompleted ? 'All done!' : 'Queue ready'}
             </span>
             <button 
               onClick={() => {/* logic to clear completed */}}
               className="text-xs text-gray-400 hover:text-gray-600"
             >
               Clear Completed
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
