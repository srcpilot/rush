import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { hashPassword, createToken } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  try {
    const body = await request.json() as Record<string, string>;
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

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const token = await createToken(user, env.JWT_SECRET);

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
