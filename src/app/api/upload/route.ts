import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { createUploadSession } from '@/lib/db.js';
import { generateR2Key, createMultipartUpload } from '@/lib/r2.js';
import { generateToken } from '@/lib/utils.js';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { filename, size, mimeType, totalParts, folderId } = await request.json();

    if (!filename || !size || !totalParts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const r2Key = generateR2Key(user.id, filename);
    const { uploadId } = await createMultipartUpload(env, r2Key);
    const sessionId = generateToken();

    await createUploadSession(env, {
      id: sessionId,
      userId: user.id,
      filename,
      size,
      mimeType,
      totalParts,
      folderId,
      r2Key,
      uploadId,
      status: 'pending'
    });

    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error: any) {
    console.error('Upload init error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
