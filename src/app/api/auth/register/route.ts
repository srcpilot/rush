import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import type { RushUser } from '@/lib/types.js';
import { getUserByEmail, createUser } from '@/lib/db.js';
import { hashPassword, createToken } from '@/lib/auth.js';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(env, {
      email,
      name,
      password_hash: hashedPassword,
      active: true,
      joined: new Date().toISOString(),
    });

    const token = await createToken(env, user.id);

    const userResponse: Pick<RushUser, 'id' | 'email' | 'name' | 'storage_used' | 'storage_quota' | 'created_at'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      storage_used: user.storage_used,
      storage_quota: user.storage_quota,
      created_at: user.created_at,
    };

    return NextResponse.json({ user: userResponse, token }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
