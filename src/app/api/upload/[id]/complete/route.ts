import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUploadSession, updateUploadSession, createFile } from '@/lib/db';
import { completeMultipartUpload } from '@/lib/r2';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = request.params;

  try {
    const { parts } = await request.json();

    if (!id || !Array.isArray(parts)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const session = await getUploadSession(env.DB, id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { file } = await completeMultipartUpload(
      env.STORAGE,
      session.file_key,
      session.upload_id,
      parts
    );

    const dbFile = await createFile(env.DB, {
      name: session.file_name,
      r2_key: session.file_key,
      size: session.file_size,
      mime_type: session.mime_type,
      owner_id: user.id,
      folder_id: session.folder_id
    });

    await updateUploadSession(env.DB, id, { status: 'complete' });

    return NextResponse.json({ file: dbFile });
  } catch (error: any) {
    console.error('Upload completion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
