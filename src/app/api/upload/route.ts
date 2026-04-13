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

    if (!file_name || !file_size || !total_parts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const file_key = generateFileKey(file_name);
    const { upload_id } = await createMultipartUpload(env.STORAGE, file_key, mime_type);

    const session = await createUploadSession(env.DB, {
      file_key,
      file_name,
      file_size,
      mime_type,
      total_parts,
      folder_id,
      upload_id,
      owner_id: user.id,
      status: 'pending'
    });

    return NextResponse.json({
      session_id: session.id,
      upload_id,
      file_key
    });
  } catch (error: any) {
    console.error('Upload initiation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
