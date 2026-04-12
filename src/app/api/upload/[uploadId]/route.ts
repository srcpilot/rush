import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { KV_NAMESPACE } from '@/lib/kv';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) {
      return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });
    }

    const kvKey = `upload:${uploadId}`;
    const kvData = await KV_NAMESPACE.get(kvKey);

    if (!kvData) {
      return NextResponse.json({ error: 'Upload not found or expired' }, { status: 404 });
    }

    const metadata = JSON.parse(kvData);

    // Return status for resume support
    return NextResponse.json({
      uploadId: metadata.uploadId,
      totalParts: metadata.totalParts,
      completedParts: metadata.completedParts,
      r2Key: metadata.r2Key,
      fileName: metadata.fileName
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
