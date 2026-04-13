import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { getUploadSession, updateUploadSession } from '@/lib/db.js';
import { abortMultipartUpload } from '@/lib/r2.js';

export async function DELETE(request: NextRequest) {
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
    const session = await getUploadSession(env, sessionId);

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await abortMultipartUpload(env, session.r2Key, session.uploadId);
    await updateUploadSession(env, sessionId, { status: 'aborted' });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Upload abort error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
