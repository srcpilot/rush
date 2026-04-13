import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getFile, deleteFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';
import { deleteObject } from '@/lib/r2.js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const file = await getFile(env, id);
    if (!file || file.userId !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ data: file });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get file' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const file = await getFile(env, id);
    if (!file || file.userId !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await deleteObject(env, file.r2Key);
    await deleteFile(env, id);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
