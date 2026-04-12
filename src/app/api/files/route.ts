import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import type { RushFile } from '@/lib/types.js';
import { listFiles, createFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const folderId = searchParams.get('folder_id');

  try {
    const files = await listFiles(env.DB, user.id, folderId);
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as { name: string; folder_id?: number; r2_key: string; size: number; mime_type: string };
    const { name, folder_id, r2_key, size, mime_type } = body;

    if (!name || !r2_key || !size || !mime_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file = await createFile(env.DB, {
      owner_id: user.id,
      name,
      folder_id,
      r2_key,
      size,
      mime_type,
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}
