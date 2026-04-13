import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
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
}

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const { token } = params;

  try {
    const share = await env.DB.prepare(`
      SELECT s.*, f.name, f.mime_type, f.size
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
      return NextResponse.json({ requires_password: true });
    }

    return NextResponse.json({ data: share });
  } catch (error: any) {
    console.error('Error fetching share:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const { token } = params;

  try {
    const body = await request.json() as Record<string, string>;
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const share = await env.DB.prepare(`
      SELECT s.*, f.name, f.mime_type, f.size
      FROM shares s
      JOIN files f ON s.file_id = f.id
      WHERE s.token = ?
    `)
      .bind(token)
      .first<ShareRow>();

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    if (share.access !== 'password') {
      return NextResponse.json({ error: 'This share is not password protected' }, { status: 400 });
    }

    const isValid = await verifyPassword(password, share.password_hash ?? '');
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ data: share });
  } catch (error: any) {
    console.error('Error verifying share password:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
