import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const file = await getFile(env.DB, parseInt(id, 10));
    if (!file || file.user_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const obj = await env.STORAGE.get(file.r2_key);
    if (!obj) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

    return new Response(obj.body, {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': `attachment; filename="${file.name ?? 'download'}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
