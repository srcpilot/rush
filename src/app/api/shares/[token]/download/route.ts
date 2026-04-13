import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { streamFile } from '@/lib/r2';
import { verifyPassword } from '@/lib/auth';

interface ShareRow {
  id: number;
  file_id: number;
  token: string;
  access: string;
  password_hash: string;
  expires_at: string | null;
  download_count: number;
  name: string;
  mime_type: string;
  size: number;
  r2_key: string;
}

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');

  try {
    const share = await env.DB.prepare(`
      SELECT shares.*, files.name, files.mime_type, files.size, files.r2_key
      FROM shares
      JOIN files ON shares.file_id = files.id
      WHERE shares.token = ?
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
      const isValid = await verifyPassword(password, share.password_hash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    await env.DB.prepare('UPDATE shares SET download_count = download_count + 1 WHERE token = ?')
      .bind(token)
      .run();

    const result = await streamFile(env.STORAGE, share.r2_key);

    if (!result) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

    return new NextResponse(result.stream as BodyInit, {
      headers: {
        'Content-Disposition': `attachment; filename="${share.name}"`,
        'Content-Type': share.mime_type || 'application/octet-stream',
        'Content-Length': share.size.toString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
