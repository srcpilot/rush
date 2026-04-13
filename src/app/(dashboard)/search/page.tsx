'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FileCard } from '@/components/file-card';
import type { RushFile } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<RushFile[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json() as { results: RushFile[] };
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Handle URL param changes (e.g. back/forward button)
  useEffect(() => {
    setQuery(queryParam);
    fetchResults(queryParam);
  }, [queryParam, fetchResults]);

  // Debounced input handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (newValue) {
        params.set('q', newValue);
      } else {
        params.delete('q');
      }
      router.replace(`?${params.toString()}`);

      // Fetch results
      fetchResults(newValue);
    }, 300);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#fafaf5] mb-6">Search</h1>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search files..."
            className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[#fafaf5] placeholder-[#a3a3a0] focus:border-[#d4a853] focus:outline-none transition-colors"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-[#d4a853] border-t-transparent rounded-full" />
            </div>
          )}
        </div>

        <div className="mt-8">
          {!queryParam ? (
            <div className="text-center py-20">
              <p className="text-[#a3a3a0] text-lg">Search your files...</p>
            </div>
          ) : loading && results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#a3a3a0]">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#a3a3a0]">No results for "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
