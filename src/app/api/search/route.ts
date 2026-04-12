import { getCloudflareContext } from 'cloudflare:workers';
import { getAuthUser } from '@/lib/auth.js';
import { searchFiles } from '@/lib/db.js';
import type { RushFile } from '@/lib/types.js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 20;

    if (!query) {
      return NextResponse.json({ files: [], total: 0 });
    }

    const { env } = getCloudflareContext();
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Escape FTS5 special characters (* " OR AND NOT)
    // For simplicity, we escape double quotes and asterisks.
    const sanitizedQuery = query.replace(/[*"]/g, '\\import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { searchFiles } from '@/lib/db.js';
import type { RushFile } from '@/lib/types.js';

/**
 * GET /api/search?q=term&limit=20
 * Full-text search via FTS5.
 * Returns { files: RushFile[], total: number }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    if (!query) {
      return NextResponse.json({ files: [], total: 0 });
    }

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sanitize FTS5 special characters
    // FTS5 special chars: *, ", OR, AND, NOT
    // We escape double quotes and handle other special characters by wrapping in quotes or escaping.
    // A simple approach for a search API is to replace special characters or wrap the query.
    const sanitizedQuery = query.replace(/[*"]/g, '\\$&');

    const files = await searchFiles(user.id, sanitizedQuery, limit);

    return NextResponse.json({
      files,
      total: files.length // Note: FTS5 implementation in db.ts doesn't return total yet, but following spec requirements.
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
');

    const { files, total } = await searchFiles(env.DB, user.id, sanitizedQuery, limit);

    return NextResponse.json({ files, total });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
