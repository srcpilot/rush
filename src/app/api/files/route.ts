import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import type { RushFile } from '@/lib/types.js';
import { listFiles, createFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  try {
    const files = await listFiles(env, user.id, folderId);
    return NextResponse.json({ data: files });
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
    const body = await request.json() as Omit<RushFile, 'id' | 'userId' | 'createdAt'>;
    const newFile = await createFile(env, user.id, body);
    return NextResponse.json({ data: newFile }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create file record' }, { status: 500 });
  }
}
