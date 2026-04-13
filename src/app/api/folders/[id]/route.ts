import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getFolder, deleteFolder } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const folder = await getFolder(env.DB, id);
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    if (folder.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({ data: folder });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folder' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const folder = await getFolder(env.DB, id);
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    if (folder.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await deleteFolder(env.DB, id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
