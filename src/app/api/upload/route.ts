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
    const { file_name, file_size, mime_type, total_parts, folder_id } = await request.json();

    const file_key = generateFileKey(file_name, folder_id);
    const { upload_id } = await createMultipartUpload(env.STORAGE, file_key, mime_type);

    const session = await createUploadSession(env, {
      user_id: user.id,
      file_name,
      file_size,
      mime_type,
      file_key,
      upload_id,
      total_parts,
      folder_id,
      status: 'pending'
    });

    return NextResponse.json({
      session_id: session.id,
      upload_id,
      file_key
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
