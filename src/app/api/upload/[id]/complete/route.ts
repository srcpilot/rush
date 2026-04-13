import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUploadSession, updateUploadSession } from '@/lib/db';
import { completeMultipartUpload, createFile } from '@/lib/r2';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = request.params;

  try {
    const { parts } = await request.json();

    const session = await getUploadSession(env, id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { file } = await completeMultipartUpload(
      env.STORAGE,
      session.file_key,
      session.upload_id,
      parts
    );

    await createFile(env, {
      name: session.file_name,
      size: session.file_size,
      mime_type: session.mime_type,
      r2_key: session.file_key,
      user_id: user.id,
      folder_id: session.folder_id
    });

    await updateUploadSession(env, id, { status: 'complete' });

    return NextResponse.json({ file });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
