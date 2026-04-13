'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FileCard } from '@/components/file-card';

interface RushFile {
  id: string;
  name: string;
  path: string;
  size: number;
  updatedAt: string;
  type: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const queryParam = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<RushFile[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
        const data = await response.json();
        setResults(data);
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

  // Handle URL sync and initial load
  useEffect(() => {
    if (queryParam !== query) {
      setQuery(queryParam);
    }
  }, [queryParam]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query === queryParam) return;

    debounceTimer.current = setTimeout(() => {
      // Update URL
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
      
      // Fetch
      fetchResults(query);
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, queryParam, router, searchParams, fetchResults]);

  // Initial fetch if query is present in URL on mount
  useEffect(() => {
    if (queryParam) {
      fetchResults(queryParam);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="min-h-screen p-6 text-[#fafaf5]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Search</h1>
        
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
