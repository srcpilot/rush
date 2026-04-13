import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createUploadSession } from '@/lib/db';
import { generateFileKey, createMultipartUpload } from '@/lib/r2';

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      file_name: string;
      file_size: number;
      mime_type: string;
      total_parts: number;
      folder_id?: number;
    };
    const { file_name, file_size, mime_type, total_parts, folder_id } = body;

    if (!file_name || !file_size || !total_parts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file_key = generateFileKey(user.id, file_name);
    const { uploadId } = await createMultipartUpload(env.STORAGE, file_key, mime_type);

    const session = await createUploadSession(env.DB, {
      file_key,
      file_name,
      mime_type,
      total_bytes: file_size,
      total_parts,
      folder_id,
      upload_id: uploadId,
      owner_id: user.id,
    });

    return NextResponse.json({
      session_id: session.id,
      upload_id: uploadId,
      file_key,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Upload initiation error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
