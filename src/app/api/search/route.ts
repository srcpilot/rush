import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { searchFiles } from '@/lib/db.js';
import type { RushFile } from '@/lib/types.js';
import { getCloudflareContext } from 'cloudflare:workers';

/**
 * GET /api/search?q=term&limit=20
 * Full-text search via FTS5.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query) {
      return NextResponse.json({ files: [], total: 0 });
    }

    const { env } = getCloudflareContext();
    const user = await getAuthUser(req, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sanitize FTS5 special characters
    const sanitizedQuery = query.replace(/[*"]/g, '\\$&');

    const files = await searchFiles(env.DB, user.id, sanitizedQuery, limit);

    return NextResponse.json({
      files,
      total: files.length,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
