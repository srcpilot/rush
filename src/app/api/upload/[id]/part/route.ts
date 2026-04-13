import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { getUploadSession, updateUploadSession } from '@/lib/db.js';
import { uploadPart } from '@/lib/r2.js';

export async function PUT(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const partNumber = parseInt(request.nextUrl.searchParams.get('part') ?? '', 10);

  if (!sessionId || isNaN(partNumber) || partNumber < 1 || partNumber > 10000) {
    return NextResponse.json({ error: 'Invalid sessionId or part number' }, { status: 400 });
  }

  try {
    const session = await getUploadSession(env.DB, sessionId);
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = await request.arrayBuffer();
    const { etag } = await uploadPart(env.STORAGE, session.file_key, session.upload_id, partNumber, body);

    return NextResponse.json({ etag }, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload part error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
