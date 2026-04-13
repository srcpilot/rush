import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUploadSession, updateUploadSession, createFile } from '@/lib/db';
import { completeMultipartUpload } from '@/lib/r2';
import type { R2UploadedPart } from '@cloudflare/workers-types';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);

  try {
    const body = await request.json() as { parts: R2UploadedPart[] };
    const { parts } = body;

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

    await completeMultipartUpload(
      env.STORAGE,
      session.file_key,
      session.upload_id,
      parts
    );

    const dbFile = await createFile(env.DB, {
      name: session.file_name,
      r2_key: session.file_key,
      size: session.total_bytes,
      mime_type: session.mime_type,
      owner_id: user.id,
      folder_id: session.folder_id,
    });

    await updateUploadSession(env.DB, id, { status: 'complete' });

    return NextResponse.json({ file: dbFile });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Upload completion error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
