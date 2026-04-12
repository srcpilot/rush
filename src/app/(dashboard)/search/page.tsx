'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context.js';
import type { RushFile } from '@/lib/types.js';
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
        const data = await response.json() as RushFile[];
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

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-3xl mx-auto">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Type to search your files"
          autoFocus
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
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
                  <span className="text-xl">&#x1F4C4;</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {file.r2_key}
                  </div>
                </div>
                <div className="ml-4 text-sm text-muted-foreground text-right">
                  <div className="whitespace-nowrap">
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : '--'}
                  </div>
                  <div className="text-xs">
                    {file.updated_at ? new Date(file.updated_at).toLocaleDateString() : ''}
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
