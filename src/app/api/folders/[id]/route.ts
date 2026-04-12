import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import type { Folder } from '@/lib/types.js';
import { getFolder, listFolders, deleteFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { env } = getCloudflareContext();

  try {
    const user = await getAuthUser(request, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folder = await getFolder(env.DB, id);
    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folder' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { env } = getCloudflareContext();

  try {
    const user = await getAuthUser(request, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { name: string };
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }

    const updatedFolder = await getFolder(env.DB, id);
    if (!updatedFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json(updatedFolder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rename folder' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { env } = getCloudflareContext();

  try {
    const user = await getAuthUser(request, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subfolders = await listFolders(env.DB, user.id);
    if (subfolders.length > 0) {
      return NextResponse.json({ error: 'Folder is not empty' }, { status: 409 });
    }

    await deleteFolder(env.DB, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
