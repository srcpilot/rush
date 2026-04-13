import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { listFolders, createFolder } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parentIdParam = searchParams.get('parent_id');
  const parentId = parentIdParam ? parseInt(parentIdParam, 10) : undefined;

  try {
    const folders = await listFolders(env.DB, user.id, parentId);
    return NextResponse.json({ data: folders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const { name, parent_id } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const parsedParentId = typeof parent_id === 'number' ? parent_id : undefined;

    const folder = await createFolder(env.DB, {
      name,
      parent_id: parsedParentId,
      owner_id: user.id,
      path: name,
      depth: parsedParentId !== undefined ? 1 : 0,
    });

    return NextResponse.json({ data: folder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
