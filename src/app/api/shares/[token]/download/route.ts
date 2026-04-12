import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPresignedR2Url } from '@/lib/r2';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;
  const { searchParams } = new URL(req.url);
  const password = searchParams.get('password');

  const share = await db.share.findUnique({
    where: { token },
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

  if (share.access === 'password_protected') {
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 403 });
    }
    // In real implementation, verify password against share.passwordHash
    const isValid = password === 'correct_password'; 
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }
  }

  const downloadUrl = await getPresignedR2Url(share.targetId);

  await db.share.update({
    where: { token },
    data: { downloadCount: { increment: 1 } }
  });

  return NextResponse.json({ url: downloadUrl });
}
