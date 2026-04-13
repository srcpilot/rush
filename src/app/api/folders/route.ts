import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import type { Folder } from '@/lib/types.js';
import { listFolders, createFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';
import { buildFolderPath } from '@/lib/utils.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');

  try {
    const folders = await listFolders(env, user.id, parentId);
    return NextResponse.json({ folders });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const folder = await createFolder(env, {
      name,
      parentId: parentId ? parseInt(parentId, 10) : undefined,
      userId: user.id,
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
