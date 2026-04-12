'use client';

import React from 'react';

interface UploadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function UploadButton({ onClick, disabled = false, label = 'Upload Files' }: UploadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center
        ${disabled 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
          : 'bg-[#d4a843] text-white hover:bg-[#c2963a] active:scale-95 shadow-sm hover:shadow-md'
        }`}
    >
      {label}
    </button>
  );
}
