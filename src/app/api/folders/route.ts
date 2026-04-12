import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import type { Folder } from '@/lib/types.js';
import { listFolders, createFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  try {
    const user = await getAuthUser(request, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_id');

    const folders: Folder[] = await listFolders(env.DB, user.id, parentId ? Number(parentId) : undefined);
    return NextResponse.json({ folders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  try {
    const user = await getAuthUser(request, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { name: string; parent_id?: number };
    const { name, parent_id } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }

    const newFolder = await createFolder(env.DB, {
      name: name.trim(),
      parent_id: parent_id ?? undefined,
      owner_id: user.id,
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
