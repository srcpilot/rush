import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { hashPassword, createToken } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  try {
    const body = await request.json() as { email: string; name: string; password: string };
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(env.DB, email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already taken' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(env.DB, {
      email,
      name,
      password_hash: passwordHash,
    });

    const token = await createToken(user, env.AUTH_SECRET);

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
