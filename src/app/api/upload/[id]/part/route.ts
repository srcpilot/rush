import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUploadSession } from '@/lib/db';
import { uploadPart } from '@/lib/r2';

export async function PUT(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = request.params;
  const partNumber = parseInt(request.nextUrl.searchParams.get('part_number') || '', 10);

  if (isNaN(partNumber)) {
    return NextResponse.json({ error: 'Invalid part number' }, { status: 400 });
  }

  try {
    const session = await getUploadSession(env, id);
    if (!session) {
      return NextResponse.json({ error: 'Upload session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { etag } = await uploadPart(
      env.STORAGE,
      session.file_key,
      session.upload_id,
      partNumber,
      request.body as ReadableStream
    );

    return NextResponse.json({ etag, part_number: partNumber });
  } catch (error: any) {
    console.error('Upload part failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
