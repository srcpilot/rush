import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getShareByToken, getFile, incrementShareDownload } from '@/lib/db.js';
import { isExpired } from '@/lib/utils.js';
import { verifyPassword } from '@/lib/auth.js';

export async function POST(req: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const url = new URL(req.url);
    const token = url.pathname.split('/').slice(-2, -1)[0];

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const share = await getShareByToken(env.DB, token);
    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    if (isExpired(share.expires_at)) {
      return NextResponse.json({ error: 'Share expired' }, { status: 410 });
    }

    if (share.max_downloads && share.downloads >= share.max_downloads) {
      return NextResponse.json({ error: 'Download limit reached' }, { status: 410 });
    }

    if (share.password_hash) {
      const body = await req.json() as { password?: string };
      const { password } = body;
      if (!password || !(await verifyPassword(password, share.password_hash))) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    if (!share.file_id) {
      return NextResponse.json({ error: 'Share is for a folder, not a direct file download' }, { status: 400 });
    }

    const file = await getFile(env.DB, share.file_id);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await incrementShareDownload(env.DB, share.id);

    const object = await env.STORAGE.get(file.r2_key);
    if (!object) {
      return NextResponse.json({ error: 'File not found in storage' }, { status: 404 });
    }

    const response = new NextResponse(object.body);
    response.headers.set('Content-Disposition', `attachment; filename="${file.name ?? 'download'}"`);
    response.headers.set('Content-Type', file.mime_type);

    return response;
  } catch (error) {
    console.error('Error downloading share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
