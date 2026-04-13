'use client';

import { FileIcon, Download, FileText, Image as ImageIcon, Music, Video, File as FileIconGeneric } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface RushFile {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  upload_date: string;
  download_count: number;
}

interface Share {
  id: string;
  // other share fields
}

interface FilePreviewProps {
  share: Share;
  file: RushFile;
  token: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-12 h-12 text-[#d4a853]" />;
  if (mimeType.startsWith('video/')) return <Video className="w-12 h-12 text-[#d4a853]" />;
  if (mimeType.startsWith('audio/')) return <Music className="w-12 h-12 text-[#d4a853]" />;
  if (mimeType.includes('pdf')) return <FileText className="w-12 h-12 text-[#d4a853]" />;
  return <FileIconGeneric className="w-12 h-12 text-[#d4a853]" />;
}

export function FilePreview({ file, token }: Omit<FilePreviewProps, 'share'>) {
  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-md mx-auto mt-16 shadow-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-4 bg-[#1a1a1a] rounded-full">
          {getFileIcon(file.mime_type)}
        </div>

        <div className="space-y-2">
          <h2 className="text-[#fafaf5] text-xl font-semibold break-all line-clamp-2">
            {file.name}
          </h2>
          <p className="text-[#a3a3a0] text-sm">
            {formatBytes(file.size)} • {file.mime_type.split('/')[1]?.toUpperCase() || 'File'}
          </p>
        </div>

        <div className="w-full pt-4 border-t border-[#262626] space-y-3 text-sm text-[#a3a3a0]">
          <div className="flex justify-between">
            <span>Uploaded</span>
            <span className="text-[#fafaf5]">{new Date(file.upload_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Downloads</span>
            <span className="text-[#fafaf5]">{file.download_count}</span>
          </div>
        </div>

        <a
          href={`/api/shares/${token}/download`}
          download
          className="w-full bg-[#d4a853] hover:bg-[#b89445] text-[#0a0a0a] font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download File
        </a>
      </div>
    </div>
  );
}
