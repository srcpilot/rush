import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { searchFiles } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  if (!q || q.trim() === '') {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  // Sanitize query for FTS5 MATCH
  // Wrap each word in double quotes and escape existing double quotes
  const sanitizedQuery = q
    .trim()
    .split(/\s+/)
    .map(word => `"${word.replace(/"/g, '')}"`)
    .join(' ');

  try {
    const { results, count } = await searchFiles(env.DB, user.id, sanitizedQuery, limit);

    return NextResponse.json({
      results,
      query: q,
      count
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
