import { NextRequest, NextResponse } from 'next/server';
import type { RushFile } from '@/lib/types.js';
import { getFile, deleteFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';
import { getCloudflareContext } from 'cloudflare:workers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const file = await getFile(params.id);
    if (!file || file.owner_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const file = await getFile(params.id);
    if (!file || file.owner_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Soft delete (setting status=trashed is handled by deleteFile if it follows pattern)
    await deleteFile(params.id, user.id);

    return NextResponse.json({ message: 'File moved to trash' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
