import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { getUserByEmail } from '@/lib/db.js';
import { verifyPassword, createToken } from '@/lib/auth.js';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const user = await getUserByEmail(env.DB, email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
