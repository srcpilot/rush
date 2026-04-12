'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'idle';
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  const getColorClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-[#4ade80]';
      case 'error':
        return 'bg-[#ef4444]';
      case 'uploading':
        return 'bg-[#d4a843]';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden relative">
      <div
        className={`h-full transition-all duration-300 ease-out ${getColorClass()} ${
          status === 'uploading' ? 'animate-pulse' : ''
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
