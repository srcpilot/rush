import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { streamFile } from '@/lib/r2';
import { verifyPassword } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;
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
      .first();

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share has expired' }, { status: 410 });
    }

    // Verify access if password protected
    if (share.access === 'password') {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }
      
      const isValid = await verifyPassword(password, share.password_hash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Increment download count
    await env.DB.prepare('UPDATE shares SET download_count = download_count + 1 WHERE token = ?')
      .bind(token)
      .run();

    // Stream from R2
    const stream = await streamFile(env.R2_BUCKET, share.r2_key);

    return new NextResponse(stream, {
      headers: {
        'Content-Disposition': `attachment; filename="${share.name}"`,
        'Content-Type': share.mime_type || 'application/octet-stream',
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
