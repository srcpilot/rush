import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createFile } from '@/lib/db';
import { generateToken } from '@/lib/utils';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { file_id, access, password, expires_at } = body;

    if (!file_id || !access) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (access === 'password' && !password) {
      return NextResponse.json({ error: 'Password required for password access' }, { status: 400 });
    }

    // Verify file ownership
    const file = await env.DB.prepare('SELECT id, user_id FROM files WHERE id = ?')
      .bind(file_id)
      .first<{ id: number, user_id: number }>();

    if (!file || file.user_id !== user.id) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
    }

    let password_hash: string | null = null;
    if (access === 'password') {
      password_hash = await hashPassword(password);
    }

    let token: string;
    let retries = 3;

    while (retries > 0) {
      token = generateToken(32);
      try {
        await env.DB.prepare(
          'INSERT INTO shares (token, file_id, user_id, access, password_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(
            token,
            file_id,
            user.id,
            access,
            password_hash,
            expires_at || null,
            new Date().toISOString()
          )
          .run();
        break;
      } catch (e: any) {
        if (e.message?.includes('UNIQUE constraint failed') && retries > 1) {
          retries--;
        } else {
          throw e;
        }
      }
    }

    const share = {
      token,
      file_id,
      access,
      expires_at
    };

    return NextResponse.json({ data: share });
  } catch (error: any) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
