import React from "react";
import { FileText, Folder, Image, FileArchive, FileCode, MoreVertical } from "lucide-react";

const IconMap: Record<string, React.ReactNode> = {
  pdf: <FileText className="text-red-400" />,
  zip: <FileArchive className="text-yellow-400" />,
  image: <Image className="text-blue-400" />,
  text: <FileText className="text-gray-400" />,
  sheet: <FileText className="text-green-400" />,
  folder: <Folder className="text-[#d4a843]" />,
};

interface FileItemProps {
  file: {
    id: string;
    name: string;
    type: string;
    size: string;
    modified: string;
  };
}

export function FileItem({ file }: FileItemProps) {
  return (
    <div className="group flex flex-col items-center p-4 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#d4a843] transition-all cursor-pointer text-center">
      <div className="w-12 h-12 mb-3 flex items-center justify-center">
        {IconMap[file.type] || <FileText />}
      </div>
      <span className="text-sm font-medium truncate w-full px-2">{file.name}</span>
      <span className="text-xs text-gray-500 mt-1">{file.size}</span>
    </div>
  );
}

export default function FileItemWrapper({ file }: { file: any }) {
    return <FileItem file={file} />;
}
