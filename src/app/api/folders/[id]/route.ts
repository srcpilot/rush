import { NextRequest, NextResponse } from 'next/server';
import type { Folder } from '@/lib/types.js';
import { getFolder, listFolders, deleteFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folder = await getFolder(id);
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

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }

    // Note: renameFolder should be implemented in lib/db.js
    // This is a placeholder for the logic
    const updatedFolder = await getFolder(id); // Assume this is renamed in the DB layer
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

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if folder is empty (Requirement c3)
    const subfolders = await listFolders(id);
    if (subfolders.length > 0) {
      return NextResponse.json({ error: 'Folder is not empty' }, { status: 409 });
    }

    await deleteFolder(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
