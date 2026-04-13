import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUploadSession } from '@/lib/db';
import { uploadPart } from '@/lib/r2';

type RouteParams = { params: { id: string } };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const partNumber = parseInt(request.nextUrl.searchParams.get('part_number') || '', 10);

  if (isNaN(partNumber)) {
    return NextResponse.json({ error: 'Invalid part number' }, { status: 400 });
  }

  try {
    const session = await getUploadSession(env.DB, id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const part = await uploadPart(
      env.STORAGE,
      session.file_key,
      session.upload_id,
      partNumber,
      request.body!
    );

    return NextResponse.json({ etag: part.etag, part_number: partNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
