"use client";

import type { RushFile } from "@/lib/types.js";
import { cn } from "@/lib/utils.js";

interface FileCardProps {
  file: RushFile;
}

export default function FileCard({ file }: FileCardProps) {
  const isImage = file.mime_type.startsWith("image/");

  return (
    <div className="group bg-[#141414] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg p-2 transition-all relative overflow-hidden">
      <div className="aspect-square bg-[#1a1a1a] rounded mb-2 flex items-center justify-center overflow-hidden relative">
        {isImage ? (
          <img
            src={`/api/files/${file.id}/thumbnail`}
            alt={file.name ?? ''}
            className="object-cover w-full h-full"
          />
        ) : (
          <svg className="w-12 h-12 text-[#d4a853]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="px-1">
        <div className="text-sm font-medium text-gray-200 truncate">{file.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'} • {file.updated_at ? new Date(file.updated_at).toLocaleDateString() : ''}
        </div>
      </div>
    </div>
  );
}
