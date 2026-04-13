'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { RushFile } from '@/lib/types.js';
import { useAuth } from '@/hooks/use-auth.js';
import SearchResults from '@/components/search-results.tsx';

export default function SearchPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RushFile[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      window.location.href = '/auth/login';
    }
  }, [user, authLoading]);

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setStatus('idle');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }, [user]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim() === '') {
      setResults([]);
      setStatus('idle');
      return;
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  if (authLoading) {
    return <div className="p-8 text-[#a3a3a0]">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafaf5] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search files..."
            className="w-full bg-[#141414] border border-[#262626] rounded-lg py-3 px-12 focus:outline-none focus:border-[#d4a853] text-[#fafaf5]"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3a3a0]">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>

        {status === 'loading' && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4a853]"></div>
          </div>
        )}

        {status === 'done' && (
          <SearchResults results={results} />
        )}

        {status === 'error' && (
          <div className="text-center text-red-500 py-12">Error performing search.</div>
        )}

        {status === 'idle' && query === '' && (
          <div className="text-center text-[#a3a3a0] py-12">Enter a search term to find files.</div>
        )}

        {status === 'done' && results.length === 0 && (
          <div className="text-center text-[#a3a3a0] py-12">No results found for "{query}".</div>
        )}
      </div>
    </div>
  );
}
