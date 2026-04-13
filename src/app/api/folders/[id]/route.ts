import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getFolder, deleteFolder } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);

  try {
    const folder = await getFolder(env.DB, id);

    if (!folder || folder.owner_id !== user.id) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 403 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);

  try {
    const folder = await getFolder(env.DB, id);

    if (!folder || folder.owner_id !== user.id) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 403 });
    }

    await deleteFolder(env.DB, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
