import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { KV_NAMESPACE } from '@/lib/kv';
import { S3Client, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) return NextResponse.json({ error: 'Missing uploadId' }, { status: 400 });

    const kvKey = `upload:${uploadId}`;
    const kvData = await KV_NAMESPACE.get(kvKey);
    
    if (kvData) {
      const metadata = JSON.parse(kvData);
      
      // 1. Abort R2 Multipart Upload
      const s3 = new S3Client({ /* R2 config */ });
      try {
        await s3.send(new AbortMultipartUploadCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: metadata.r2Key,
          UploadId: metadata.uploadId
        }));
      } catch (abortError) {
        console.error('R2 Abort failed:', abortError);
        // Continue to cleanup KV even if R2 abort fails (to avoid stale records)
      }

      // 2. Cleanup KV tracking
      await KV_NAMESPACE.delete(kvKey);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Abort upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
