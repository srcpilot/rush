import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { streamFile } from '@/lib/r2';
import { verifyPassword } from '@/lib/auth';

interface ShareRow {
  id: number;
  file_id: number;
  token: string;
  access: string;
  password_hash: string | null;
  expires_at: string | null;
  download_count: number;
  name: string;
  mime_type: string;
  size: number;
  r2_key: string;
}

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const { token } = params;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');

  try {
    const share = await env.DB.prepare(`
      SELECT s.*, f.name, f.mime_type, f.size, f.r2_key
      FROM shares s
      JOIN files f ON s.file_id = f.id
      WHERE s.token = ?
    `)
      .bind(token)
      .first<ShareRow>();

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share expired' }, { status: 410 });
    }

    if (share.access === 'password') {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }

      const isValid = await verifyPassword(password, share.password_hash ?? '');
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Increment download count
    await env.DB.prepare('UPDATE shares SET download_count = download_count + 1 WHERE token = ?')
      .bind(token)
      .run();

    const result = await streamFile(env.STORAGE, share.r2_key);

    if (!result) {
      return NextResponse.json({ error: 'File data not found' }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${share.name}"`,
        'Content-Type': result.contentType,
        'Content-Length': share.size.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error downloading share:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
