import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { getAuthUser } from '@/lib/auth.js';
import { generateToken } from '@/lib/utils.js';
import type { Share } from '@/lib/types.js';

export async function POST(req: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(req, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json() as { file_id?: number; folder_id?: number; access?: string; password?: string; expires_in_hours?: number; max_downloads?: number };
    const { file_id, folder_id, access, password, expires_in_hours, max_downloads } = body;

    if (!file_id && !folder_id) {
      return NextResponse.json({ error: 'file_id or folder_id required' }, { status: 400 });
    }

    const token = generateToken();

    const expires_at = expires_in_hours
      ? new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()
      : undefined;

    const newShare: Partial<Share> = {
      token,
      file_id: file_id || undefined,
      folder_id: folder_id || undefined,
      access: (access === 'password' ? 'password' : 'public') as 'public' | 'password',
      password_hash: password ? 'hashed_password_placeholder' : undefined,
      expires_at,
      max_downloads: max_downloads || undefined,
      downloads: 0,
      created_by: user.id,
    };

    // DB insert would go here

    return NextResponse.json({
      token,
      url: `/api/shares/${token}`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
