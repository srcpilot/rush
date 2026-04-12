"use client";

import { cn } from "@/lib/utils.js";

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ 
  message = "No files found in this folder",
  icon 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#262626] rounded-xl bg-[#141414]">
      <div className="text-[#262626] mb-4">
        {icon || (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-300">{message}</h3>
      <p className="text-sm text-muted-foreground mt-1">Try uploading something or creating a new folder.</p>
    </div>
  );
}
