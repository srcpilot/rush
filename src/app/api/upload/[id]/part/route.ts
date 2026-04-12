import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { getUploadSession, updateUploadSession } from '@/lib/db.js';
import { uploadPart } from '@/lib/r2.js';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(request, env);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const partNumber = parseInt(request.nextUrl.searchParams.get('partNumber') || '', 10);

    if (isNaN(partNumber)) {
      return NextResponse.json({ error: 'Missing partNumber' }, { status: 400 });
    }

    const session = await getUploadSession(env.DB, params.id);
    if (!session || session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const result = await uploadPart(
      env.R2_BUCKET,
      session.file_key,
      session.upload_id,
      partNumber,
      request.body!
    );

    await updateUploadSession(env.DB, params.id, {
      completed_parts: (session.completed_parts || 0) + 1
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Part upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
