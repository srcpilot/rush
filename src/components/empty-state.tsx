'use client';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-4 text-[#a3a3a0]">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      
      <h3 className="text-[#fafaf5] text-lg font-medium mb-1">
        {title}
      </h3>
      
      {description && (
        <p className="text-[#a3a3a0] text-sm max-w-xs mb-6">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#262626] text-[#fafaf5] rounded-md text-sm font-medium hover:border-[#d4a853] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
