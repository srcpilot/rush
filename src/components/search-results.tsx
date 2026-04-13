import type { RushFile } from '@/lib/types.js';

interface SearchResultsProps {
  results: RushFile[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="space-y-2">
      {results.map((file) => (
        <div 
          key={file.id} 
          className="flex items-center justify-between p-4 bg-[#141414] border border-[#262626] rounded-lg hover:border-[#d4a853] transition-colors group"
        >
          <div className="flex items-center space-x-4">
            <div className="text-[#a3a3a0]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <div className="font-medium text-[#fafaf5]">{file.name}</div>
              <div className="text-xs text-[#a3a3a0]">
                {file.size} • {file.mime_type}
              </div>
            </div>
          </div>
          <a 
            href={file.download_url} 
            className="opacity-0 group-hover:opacity-100 text-[#d4a853] text-sm font-medium transition-opacity"
            download
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
