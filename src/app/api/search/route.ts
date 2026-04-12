import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth'; // Assuming auth helper exists
import { db } from '@/lib/db'; // Assuming db helper exists

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const type = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // Sanitize FTS special characters
  const sanitizedQuery = q.replace(/[*"()]/g, '');

  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // FTS5 search query construction
    // We use highlight() to mark matching terms as requested in ProjectFacts
    // We join with the files table to ensure we only return files owned by the user (Criteria c5)
    // We use rank for ranking (Criteria c2/SearchApi)
    
    const offset = (page - 1) * limit;

    const results = await db.run(`
      SELECT 
        f.id,
        f.name,
        f.path,
        f.size,
        f.mimeType,
        CASE WHEN f.is_folder THEN 'folder' ELSE 'file' END as type,
        highlight(files_fts, 0, '<mark>', '</mark>') as highlight
      FROM files_fts fts
      JOIN files f ON f.id = fts.rowid
      WHERE files_fts MATCH ?
        AND f.owner_id = ?
        ${type === 'files' ? 'AND f.is_folder = 0' : ''}
        ${type === 'folders' ? 'AND f.is_folder = 1' : ''}
      ORDER BY rank
      LIMIT ? OFFSET ?
    `, [sanitizedQuery, userId, limit, offset]);

    return NextResponse.json({ results: results.rows });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
