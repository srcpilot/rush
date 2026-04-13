import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import type { RushUser } from '@/lib/types.js';
import { getUserByEmail } from '@/lib/db.js';
import { verifyPassword, createToken } from '@/lib/auth.js';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<RushUser>();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken(env, user.id);

    const userResponse: Pick<RushUser, 'id' | 'email' | 'name' | 'storage_used' | 'storage_quota' | 'created_at'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      storage_used: user.storage_used,
      storage_quota: user.storage_quota,
      created_at: user.created_at,
    };

    return NextResponse.json({ user: userResponse, token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
