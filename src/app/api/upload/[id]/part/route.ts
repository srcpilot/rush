import { getCloudflareContext } from 'cloudflare:workers';
import { getAuthUser } from '@/lib/auth.js';
import { getUploadSession, updateUploadSession } from '@/lib/db.js';
import { uploadPart } from '@/lib/r2.js';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = request.nextUrl.searchParams;
    const partNumber = parseInt(request.nextUrl.searchParams.get('partNumber') || '', 10);

    if (!id || isNaN(partNumber)) {
      return NextResponse.json({ error: 'Missing id or partNumber' }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = env.DB;
    const bucket = env.R2_BUCKET;

    const session = await getUploadSession(db, id);
    if (!session || session.user_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Stream the body directly to R2
    const result = await uploadPart(
      bucket,
      session.file_key,
      session.upload_id,
      partNumber,
      request.body!
    );

    // Update completed parts count in DB
    await updateUploadSession(db, id, {
      completed_parts: (session.completed_parts || 0) + 1
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Part upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
