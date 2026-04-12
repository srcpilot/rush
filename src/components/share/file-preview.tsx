"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: {
    name: string;
    size?: number;
    mimeType?: string;
    url?: string;
  };
  downloadUrl: string;
}

export function FilePreview({ file, downloadUrl }: FilePreviewProps) {
  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");
  const isAudio = file.mimeType?.startsWith("audio/");
  const isPdf = file.mimeType === "application/pdf";

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb > 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  return (
    <div className="flex flex-col items-center space-y-6 rounded-xl border bg-card p-6 shadow-sm w-full">
      <div className="w-full flex flex-col items-center justify-center space-y-4">
        {isImage && (
          <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg border bg-muted">
            <Image
              src={file.url || ""}
              alt={file.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        {isVideo && (
          <div className="w-full max-w-2xl overflow-hidden rounded-lg border bg-black">
            <video controls className="w-full">
              <source src={file.url || ""} type={file.mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {isAudio && (
          <div className="w-full max-w-md">
            <audio controls className="w-full">
              <source src={file.url || ""} type={file.mimeType} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {isPdf && (
          <div className="w-full aspect-[3/4] max-w-md overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
             <p className="text-sm text-muted-foreground text-center p-4">
                PDF preview not available. Please download to view.
             </p>
          </div>
        )}

        {!isImage && !isVideo && !isAudio && !isPdf && (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-16 w-16 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="w-full space-y-2 text-center">
        <h3 className="text-lg font-medium break-all">{file.name}</h3>
        <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
      </div>

      <a
        href={downloadUrl}
        download
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
        )}
      >
        Download File
      </a>
    </div>
  );
}
