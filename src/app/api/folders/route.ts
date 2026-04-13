import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { listFolders, createFolder, getFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentIdParam = searchParams.get('parentId');
  const parentId = parentIdParam ? parseInt(parentIdParam, 10) : undefined;

  try {
    const folders = await listFolders(env.DB, user.id, parentId);
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
    const body = await request.json() as { name: string; parentId?: string };
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let path = `/${name}`;
    let depth = 0;
    let parent_id: number | undefined;

    if (parentId) {
      const numericParentId = parseInt(parentId, 10);
      const parentFolder = await getFolder(env.DB, numericParentId);
      if (parentFolder) {
        path = `${parentFolder.path}/${name}`;
        depth = parentFolder.depth + 1;
        parent_id = numericParentId;
      }
    }

    const folder = await createFolder(env.DB, {
      name,
      parent_id,
      owner_id: user.id,
      path,
      depth,
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
