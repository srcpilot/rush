import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateShareToken } from '@/lib/shares/utils';
import { crypto } from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileId, folderId, access, password, expiresIn } = await req.json();
  
  const token = generateShareToken();
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
  
  const share = await db.share.create({
    data: {
      creatorId: session.user.id,
      targetId: fileId || folderId,
      targetType: fileId ? 'file' : 'folder',
      access,
      passwordHash: password ? await hashPassword(password) : null,
      expiresAt,
      token,
    }
  });

  const url = `https://rush.mvrx.app/s/${token}`;

  return NextResponse.json({ token, url, share });
}

async function hashPassword(password: string) {
  // Placeholder for PBKDF2 implementation
  return "hashed_password";
}
