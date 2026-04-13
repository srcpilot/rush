import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUploadSession, updateUploadSession, createFile } from '@/lib/db';
import { completeMultipartUpload } from '@/lib/r2';

type RouteParams = { params: { id: string } };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const { parts } = body;

    const session = await getUploadSession(env.DB, id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await completeMultipartUpload(
      env.STORAGE,
      session.file_key,
      session.upload_id,
      parts as any
    );

    const file = await createFile(env.DB, {
      name: session.file_name,
      size: session.total_bytes,
      mime_type: '',
      r2_key: session.file_key,
      owner_id: session.owner_id,
      folder_id: session.folder_id,
    });

    await updateUploadSession(env.DB, id, { status: 'complete' });

    return NextResponse.json({ file });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
