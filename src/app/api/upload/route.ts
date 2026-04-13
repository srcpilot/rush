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
    const body = await request.json() as Record<string, unknown>;
    const { file_name, file_size, mime_type, total_parts, folder_id } = body;

    if (typeof file_name !== 'string' || typeof mime_type !== 'string') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const file_key = generateFileKey(user.id, file_name);
    const { uploadId } = await createMultipartUpload(env.STORAGE, file_key, mime_type);

    const session = await createUploadSession(env.DB, {
      file_name,
      file_key,
      upload_id: uploadId,
      total_parts: typeof total_parts === 'number' ? total_parts : 1,
      total_bytes: typeof file_size === 'number' ? file_size : 0,
      folder_id: typeof folder_id === 'number' ? folder_id : undefined,
      owner_id: user.id,
    });

    return NextResponse.json({
      session_id: session?.id,
      upload_id: uploadId,
      file_key,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
