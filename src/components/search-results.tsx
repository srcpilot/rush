'use client';

import React from 'react';
import { SearchResult } from '@/lib/search';
import { File, Folder, ChevronRight } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        No results found.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {results.map((result) => (
        <div
          key={result.id}
          onClick={() => onSelect(result)}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer group transition-colors"
        >
          <div className="flex-shrink-0">
            {result.type === 'file' ? (
              <File className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm font-medium text-gray-900 truncate"
              dangerouslySetInnerHTML={{ __html: result.highlight || result.name }}
            />
            <p className="text-xs text-gray-500 truncate">
              {result.path}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>
      ))}
    </div>
  );
}
