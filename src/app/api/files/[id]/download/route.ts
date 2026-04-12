import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/db.js';
import { getAuthUser } from '@/lib/auth.js';
import { streamFile } from '@/lib/r2.js';
import { getCloudflareContext } from 'cloudflare:workers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const file = await getFile(params.id);
    if (!file || file.owner_id !== user.id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stream = await streamFile(env.R2_BUCKET, file.r2_key);
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': file.mime_type,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
