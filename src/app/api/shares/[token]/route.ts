import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;

  const share = await db.share.findUnique({
    where: { token },
    include: { target: true }
  });

  if (!share) {
    return NextResponse.json({ error: 'Share not found' }, { status: 404 });
  }

  if (share.expiresAt && share.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Share expired' }, { status: 410 });
  }

  if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
    return NextResponse.json({ error: 'Download limit exceeded' }, { status: 410 });
  }

  return NextResponse.json({
    share,
    target: share.target,
    requiresPassword: share.access === 'password_protected'
  });
}
