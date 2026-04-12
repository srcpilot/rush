'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, File, Folder, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming useDebounce exists
import { searchFiles, SearchResult } from '@/lib/search';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchFiles({ q: debouncedQuery });
        setResults(response.results);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    router.push(result.path);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Timeout to allow clicking results
          placeholder="Search files... (Cmd+K)"
          className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || (query.length >= 2 && isSearching)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  {result.type === 'file' ? (
                    <File className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Folder className="h-4 w-4 text-amber-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p 
                      className="text-sm font-medium text-gray-900 truncate"
                      dangerouslySetInnerHTML={{ __html: result.highlight || result.name }}
                    />
                    <p className="text-xs text-gray-500 truncate">{result.path}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
