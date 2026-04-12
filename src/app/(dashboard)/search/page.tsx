'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context.js';
import type { RushFile } from '@/lib/types.js';
import SearchInput from '@/components/search-input';
import { cn } from '@/lib/utils.js';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<RushFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Sync query from URL to state
  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  // Handle search input change and sync to URL
  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    router.replace(`?${params.toString()}`);
  };

  // Trigger fetch when debounced search query changes
  // Note: SearchInput handles the 300ms debounce and calls handleSearchChange
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-3xl mx-auto">
        <SearchInput 
          value={searchQuery} 
          onChange={handleSearchChange} 
          placeholder="Type to search your files"
          autoFocus
        />
      </div>

      <div className="max-w-4xl mx-auto">
        {isLoading && (
          <div className="text-center py-10 text-muted-foreground">
            Searching...
          </div>
        )}

        {!isLoading && searchQuery === '' && (
          <div className="text-center py-20 text-muted-foreground">
            <p>Type to search your files</p>
          </div>
        )}

        {!isLoading && searchQuery !== '' && results.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No files found for "{searchQuery}"</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-2">
            {results.map((file) => (
              <div 
                key={file.id}
                className="flex items-center p-3 hover:bg-accent rounded-lg transition-colors cursor-pointer"
              >
                <div className="mr-4">
                  {/* Simple icon representation */}
                  <span className="text-xl">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {file.path}
                  </div>
                </div>
                <div className="ml-4 text-sm text-muted-foreground text-right">
                  <div className="whitespace-nowrap">
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : '--'}
                  </div>
                  <div className="text-xs">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
