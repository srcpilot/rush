import { createFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';
import { generateFileKey, initiateMultipartUpload } from '@/lib/r2.js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_name, total_bytes, mime_type, folder_id } = await request.json();

    if (!file_name || !total_bytes || !mime_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file_key = generateFileKey(user.id, file_name);
    const r2_upload = await initiateMultipartUpload(file_key);

    const session = await createFile('upload_sessions', {
      file_key,
      upload_id: r2_upload.uploadId,
      file_name,
      mime_type,
      total_bytes,
      completed_parts: 0,
      folder_id: folder_id || null,
      user_id: user.id,
    });

    return NextResponse.json({
      session_id: session.id,
      upload_id: r2_upload.uploadId,
      file_key
    });
  } catch (error: any) {
    console.error('Initiate upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
