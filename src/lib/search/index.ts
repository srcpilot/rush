export type SearchResultType = 'file' | 'folder';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  path: string;
  size?: number;
  mimeType?: string;
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchParams {
  q: string;
  type?: 'all' | 'files' | 'folders';
  page?: number;
  limit?: number;
}

export async function searchFiles(params: SearchParams): Promise<SearchResponse> {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`/api/search?${query}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
}
