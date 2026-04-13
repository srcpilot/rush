import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { listFolders, createFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';
import { buildFolderPath } from '@/lib/utils.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const folders = await listFolders(env.DB, user.id);
    return NextResponse.json(folders);
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
    const body = await request.json() as { name: string; parentId?: number };
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const path = parentId
      ? await buildFolderPath(env.DB, parentId)
      : '/';
    await createFolder(env.DB, {
      name,
      parent_id: parentId ?? null,
      path: path === '/' ? `/${name}` : `${path}/${name}`,
      owner_id: user.id,
    });

    return NextResponse.json({ message: 'Folder created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
