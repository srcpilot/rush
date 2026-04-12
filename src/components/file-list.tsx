import React from "react";
import { FileText, MoreVertical, Eye } from "lucide-react";

interface FileListProps {
  files: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    modified: string;
  }>;
}

export default function FileList({ files }: FileListProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-gray-500 border-b border-[#2a2a2a]">
          <tr>
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Size</th>
            <th className="pb-3 font-medium">Modified</th>
            <th className="pb-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1a1a1a]">
          {files.map((file) => (
            <tr key={file.id} className="group hover:bg-[#1a1a1a] transition-colors">
              <td className="py-4 flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#d4a843]" />
                <span className="font-medium">{file.name}</span>
              </td>
              <td className="py-4 text-gray-400">{file.size}</td>
              <td className="py-4 text-gray-400">{file.modified}</td>
              <td className="py-4 text-right">
                <button className="p-1 hover:text-[#d4a843]">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
