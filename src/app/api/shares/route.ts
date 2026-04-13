import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { getAuthUser } from '@/lib/auth';
import { generateToken } from '@/lib/utils';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      file_id: number;
      access: string;
      password?: string;
      expires_at?: string;
    };
    const { file_id, access, password, expires_at } = body;

    if (!file_id || !access) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file = await env.DB.prepare('SELECT * FROM files WHERE id = ? AND owner_id = ?')
      .bind(file_id, user.id)
      .first();

    if (!file) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    let password_hash: string | null = null;
    if (access === 'password') {
      if (!password) {
        return NextResponse.json({ error: 'Password required for password access' }, { status: 400 });
      }
      password_hash = await hashPassword(password);
    }

    let shareToken: string = generateToken(32);
    let retries = 3;
    while (retries > 0) {
      shareToken = generateToken(32);
      try {
        await env.DB.prepare(
          'INSERT INTO shares (token, file_id, owner_id, access, password_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
        )
          .bind(shareToken, file_id, user.id, access, password_hash, expires_at || null)
          .run();
        break;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('UNIQUE constraint failed') && retries > 1) {
          retries--;
        } else {
          throw e;
        }
      }
    }

    const share = await env.DB.prepare('SELECT * FROM shares WHERE token = ?')
      .bind(shareToken)
      .first();

    return NextResponse.json({ data: share });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
