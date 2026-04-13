import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { verifyPassword } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;

  try {
    const share = await env.DB.prepare(`
      SELECT shares.*, files.name, files.mime_type, files.size 
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

    if (share.access === 'password') {
      return NextResponse.json({ requires_password: true });
    }

    return NextResponse.json({ data: share });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const { env } = getCloudflareContext();
  const token = params.token;

  try {
    const { password } = await request.json();

    const share = await env.DB.prepare(`
      SELECT shares.*, files.name, files.mime_type, files.size 
      FROM shares 
      JOIN files ON shares.file_id = files.id 
      WHERE shares.token = ?
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

    return NextResponse.json({ data: share });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
