import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { createUser, getUserByEmail } from '@/lib/db.js';
import { hashPassword, createToken } from '@/lib/auth.js';

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json() as { email: string; name: string; password: string };

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 });
    }

    if (name.length < 2) {
      return NextResponse.json({ error: 'Name too short' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const existingUser = await getUserByEmail(env.DB, email);
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(env.DB, {
      email,
      name,
      password_hash: passwordHash,
    });

    const secret = env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
    const token = createToken(user.id, secret);

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
