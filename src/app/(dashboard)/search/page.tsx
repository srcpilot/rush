'use client'; import { useState, useEffect, useCallback } from 'react'; import { useSearchParams, useRouter } from 'next/navigation'; import { useAuth } from '@/lib/auth-context'; import { FileCard } from '@/components/file-card'; import { cn } from '@/lib/utils';
import type { RushFile } from '@/lib/types';
import SearchInput from '@/components/search-input';

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
          placeholder="Search files..."
          className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[#fafaf5] placeholder-[#a3a3a0] focus:border-[#d4a853] focus:outline-none"
        />
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading && (
          <div className="text-center py-10 text-[#a3a3a0]">
            Searching...
          </div>
        )}

        {!isLoading && searchQuery === '' && (
          <div className="text-center py-20 text-[#a3a3a0]">
            <p className="text-xl">Search your files</p>
          </div>
        )}

        {!isLoading && searchQuery !== '' && results.length === 0 && (
          <div className="text-center py-20 text-[#a3a3a0]">
            <p>No results for "{searchQuery}"</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {results.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
