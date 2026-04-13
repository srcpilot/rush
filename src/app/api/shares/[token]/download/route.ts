import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { streamFile } from '@/lib/r2';

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
      .first();

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Check expiration
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share expired' }, { status: 410 });
    }

    // Verify access
    if (share.access === 'password') {
      if (!password) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 });
      }
      
      const { verifyPassword } = await import('@/lib/auth');
      const isValid = await verifyPassword(password, share.password_hash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Increment download count
    await env.DB.prepare('UPDATE shares SET download_count = download_count + 1 WHERE token = ?')
      .bind(token)
      .run();

    // Stream file from R2
    const fileStream = await streamFile(env.R2_BUCKET, share.r2_key);

    return new NextResponse(fileStream, {
      headers: {
        'Content-Disposition': `attachment; filename="${share.name}"`,
        'Content-Type': share.mime_type || 'application/octet-stream',
        'Content-Length': share.size.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
