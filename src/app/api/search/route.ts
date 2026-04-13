import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import type { RushFile } from '@/lib/types.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim() === '') {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Sanitize query: replace non-alphanumeric characters with space to prevent FTS5 syntax errors
  const sanitizedQuery = q.replace(/[^a-zA-Z0-9 ]/g, ' ').trim();

  if (!sanitizedQuery) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  try {
    // Use prefix query (sanitizedQuery + '*') for partial word matching
    const results = await env.DB.prepare(
      `SELECT f.* 
       FROM files_fts fts 
       JOIN files f ON f.id = fts.rowid 
       WHERE files_fts MATCH ? AND f.user_id = ? 
       ORDER BY rank 
       LIMIT 50`
    )
    .bind(sanitizedQuery + '*', user.id)
    .all<RushFile[]>();

    return NextResponse.json({ files: results.results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
