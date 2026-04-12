import React from "react";
import { FileItem } from "./file-item";

interface FileGridProps {
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    modified: string;
  }>;
}

export default function FileGrid({ files }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <FileItem key={file.id} file={file} />
      ))}
    </div>
  );
}
