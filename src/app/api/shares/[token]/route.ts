import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
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
      return NextResponse.json({ requires_password: true });
    }

    return NextResponse.json({ data: share });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;

  try {
    const body = await request.json() as { password: string };

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

    if (share.access !== 'password') {
      return NextResponse.json({ error: 'This share is not password protected' }, { status: 400 });
    }

    const isValid = await verifyPassword(body.password, share.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ data: share });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
