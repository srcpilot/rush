import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getShareByToken, getFile, incrementShareDownload } from '@/lib/db.js';
import { isExpired } from '@/lib/utils.js';

export async function GET(req: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const url = new URL(req.url);
    const token = url.pathname.split('/').pop();

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

    let fileInfo = null;
    if (share.file_id) {
      fileInfo = await getFile(env.DB, share.file_id);
    }

    // Remove sensitive info
    const { password_hash, ...publicShare } = share;

    return NextResponse.json({
      ...publicShare,
      file: fileInfo ? {
        id: fileInfo.id,
        name: fileInfo.name,
        size: fileInfo.size,
        mime_type: fileInfo.mime_type,
      } : null,
    });
  } catch (error) {
    console.error('Error verifying share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
