import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from 'cloudflare:workers';
import { getAuthUser } from '@/lib/auth.js';
import { generateFileKey, initiateMultipartUpload } from '@/lib/r2.js';
import { updateUploadSession } from '@/lib/db.js';

export async function POST(request: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(request, env);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_name, total_bytes, mime_type, folder_id } = await request.json() as { file_name: string; total_bytes: number; mime_type: string; folder_id?: number };

    if (!file_name || !total_bytes || !mime_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file_key = generateFileKey(user.id, file_name);
    const r2_upload = await initiateMultipartUpload(env.R2_BUCKET, file_key);

    // Store upload session in D1
    const sessionId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO upload_sessions (id, file_name, file_key, upload_id, total_bytes, mime_type, completed_parts, folder_id, owner_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(sessionId, file_name, file_key, r2_upload.uploadId, total_bytes, mime_type, 0, folder_id ?? null, user.id, 'uploading').run();

    return NextResponse.json({
      session_id: sessionId,
      upload_id: r2_upload.uploadId,
      file_key
    });
  } catch (error: any) {
    console.error('Initiate upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
