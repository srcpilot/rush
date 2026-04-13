import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { getUploadSession, updateUploadSession, createRushFile } from '@/lib/db.js';
import { completeMultipartUpload } from '@/lib/r2.js';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  try {
    const body = await request.json() as { parts?: { partNumber: number; etag: string }[] };
    const { parts } = body;
    const session = await getUploadSession(env.DB, sessionId);

    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await completeMultipartUpload(env.STORAGE, session.file_key, session.upload_id, parts ?? []);

    await updateUploadSession(env.DB, sessionId, { status: 'complete' });

    await createRushFile(env.DB, {
      name: session.file_name,
      size: session.total_bytes,
      mime_type: session.mime_type,
      r2_key: session.file_key,
      user_id: user.id,
      folder_id: session.folder_id,
      status: 'active',
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload complete error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
