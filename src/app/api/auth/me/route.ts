import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import type { RushUser } from '@/lib/types.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(request, env);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResponse: Pick<RushUser, 'id' | 'email' | 'name' | 'storage_used' | 'storage_quota' | 'created_at'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      storage_used: user.storage_used,
      storage_quota: user.storage_quota,
      created_at: user.created_at,
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
