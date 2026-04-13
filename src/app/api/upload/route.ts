import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { createUploadSession } from '@/lib/db.js';
import { generateFileKey, initiateMultipartUpload } from '@/lib/r2.js';
import { generateToken } from '@/lib/utils.js';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      filename?: string;
      size?: number;
      mimeType?: string;
      totalParts?: number;
      folderId?: number;
    };
    const { filename, size, mimeType, totalParts, folderId } = body;

    if (!filename || !size || !totalParts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const r2Key = generateFileKey(user.id, filename);
    const { uploadId } = await initiateMultipartUpload(env.STORAGE, r2Key);
    const sessionId = generateToken();

    await createUploadSession(env.DB, {
      id: sessionId,
      user_id: user.id,
      file_name: filename,
      total_bytes: size,
      mime_type: mimeType ?? '',
      completed_parts: JSON.stringify([]),
      folder_id: folderId ?? null,
      file_key: r2Key,
      upload_id: uploadId,
    });

    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error: unknown) {
    console.error('Upload init error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
