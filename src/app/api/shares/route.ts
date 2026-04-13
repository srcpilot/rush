import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hashPassword } from '@/lib/auth';
import { createFile } from '@/lib/db';
import { generateToken } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { file_id, access, password, expires_at } = await request.json();

    if (!file_id) {
      return NextResponse.json({ error: 'file_id is required' }, { status: 400 });
    }

    // Verify file ownership
    const file = await env.DB.prepare('SELECT * FROM files WHERE id = ? AND user_id = ?')
      .bind(file_id, user.id)
      .first();

    if (!file) {
      return NextResponse.json({ error: 'File not found or unauthorized' }, { status: 404 });
    }

    let password_hash: string | null = null;
    if (access === 'password') {
      if (!password) {
        return NextResponse.json({ error: 'password is required for password access' }, { status: 400 });
      }
      password_hash = await hashPassword(password);
    }

    let token = '';
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
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
        if (e.message?.includes('UNIQUE constraint failed') || e.code === '23505') {
          retryCount++;
          if (retryCount === maxRetries) {
            throw new Error('Failed to generate unique token');
          }
        } else {
          throw e;
        }
      }
    }

    const share = {
      token,
      file_id,
      access,
      expires_at,
    };

    return NextResponse.json({ data: share });
  } catch (error: any) {
    console.error('Share creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
