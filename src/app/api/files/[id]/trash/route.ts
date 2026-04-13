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
    const file = await getFile(env.DB, parseInt(params.id, 10));
    if (!file || file.user_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await deleteFile(env.DB, parseInt(params.id, 10));

    return NextResponse.json({ message: 'File moved to trash' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trash status' }, { status: 500 });
  }
}
