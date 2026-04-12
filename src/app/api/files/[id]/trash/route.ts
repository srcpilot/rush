import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { getFile, deleteFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const file = await getFile(env.DB, params.id);
    if (!file || file.owner_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await deleteFile(env.DB, params.id, user.id);

    return NextResponse.json({ message: 'Trash status toggled' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trash status' }, { status: 500 });
  }
}
