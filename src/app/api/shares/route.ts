import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hashPassword } from '@/lib/auth.js';
import { generateToken, isExpired } from '@/lib/utils.js';
import { createShare, getShareByToken, getFile, incrementShareDownload } from '@/lib/db.js';
import { getObject } from '@/lib/r2.js';

export async function POST(req: NextRequest) {
  try {
    const { env } = getCloudflareContext();
    const user = await getAuthUser(req, env);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fileId, folderId, access, password, expiresAt, maxDownloads } = body;

    if (!fileId && !folderId) {
      return NextResponse.json({ error: 'Either fileId or folderId required' }, { status: 400 });
    }

    const token = generateToken();
    const id = crypto.randomUUID();
    const password_hash = password ? await hashPassword(password) : null;

    const newShare = {
      id,
      token,
      file_id: fileId || null,
      folder_id: folderId || null,
      access: access || 'public',
      password_hash,
      expires_at: expiresAt ? new Date(expiresAt) : null,
      max_downloads: maxDownloads ? parseInt(maxDownloads) : null,
      downloads: 0,
      created_at: new Date().toISOString(),
    };

    await createShare(env.DB, newShare);

    return NextResponse.json({
      token,
      url: `/api/shares/${token}`
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
