import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(request, env);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
