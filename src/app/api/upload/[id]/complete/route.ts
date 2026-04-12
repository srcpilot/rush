import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { getUploadSession, createFile } from '@/lib/db.js';
import { completeMultipartUpload } from '@/lib/r2.js';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(request, env);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { parts } = await request.json() as { parts: { partNumber: number; etag: string }[] };

    if (!Array.isArray(parts)) {
      return NextResponse.json({ error: 'Missing parts' }, { status: 400 });
    }

    const session = await getUploadSession(env.DB, params.id);
    if (!session || session.owner_id !== user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await completeMultipartUpload(
      env.R2_BUCKET,
      session.file_key,
      session.upload_id,
      parts
    );

    const file = await createFile(env.DB, {
      name: session.file_name,
      size: session.total_bytes,
      mime_type: session.file_key,
      owner_id: user.id,
      folder_id: session.folder_id,
      r2_key: session.file_key,
      status: 'active',
    });

    return NextResponse.json(file);

  } catch (error: any) {
    console.error('Complete upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
