import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;

  try {
    const share = await env.DB.prepare(`
      SELECT s.*, f.name, f.mime_type, f.size 
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

    if (share.access === 'password') {
      return NextResponse.json({ requires_password: true });
    }

    // Return share and file info (excluding password_hash)
    const { password_hash, ...shareData } = share;
    return NextResponse.json({ data: { share: shareData, file: { name: share.name, mime_type: share.mime_type, size: share.size } } });
  } catch (error: any) {
    console.error('Share retrieval error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;

  try {
    const { password } = await request.json();

    const share = await env.DB.prepare(`
      SELECT s.*, f.name, f.mime_type, f.size 
      FROM shares s 
      JOIN files f ON s.file_id = f.id 
      WHERE s.token = ?
    `)
      .bind(token)
      .first();

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    if (share.access !== 'password') {
      return NextResponse.json({ error: 'This share is not password protected' }, { status: 400 });
    }

    const isValid = await verifyPassword(password, share.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Return share and file info (excluding password_hash)
    const { password_hash, ...shareData } = share;
    return NextResponse.json({ data: { share: shareData, file: { name: share.name, mime_type: share.mime_type, size: share.size } } });
  } catch (error: any) {
    console.error('Share verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
