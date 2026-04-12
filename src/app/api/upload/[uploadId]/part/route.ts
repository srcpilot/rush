import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { KV_NAMESPACE } from '@/lib/kv';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'; // Simulated or actual S3 client for R2
import { getPresignedUrl } from '@/lib/s3-presign'; // Helper for generating presigned URLs

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get('uploadId');
    const partNumber = parseInt(searchParams.get('partNumber') || '', 10);

    if (!uploadId || isNaN(partNumber)) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const kvKey = `upload:${uploadId}`;
    const kvData = await KV_NAMESPACE.get(kvKey);
    if (!kvData) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    const metadata = JSON.parse(kvData);
    
    // In a real R2 environment, we'd use the S3 SDK to generate a presigned URL for a specific part.
    // Example: s3.getSignedUrl('uploadPart', { Bucket, Key, PartNumber, UploadId })
    const presignedUrl = await getPresignedUrl({
      bucket: process.env.R2_BUCKET_NAME!,
      key: metadata.r2Key,
      uploadId: metadata.uploadId,
      partNumber: partNumber
    });

    return NextResponse.json({
      presignedUrl,
      partNumber
    });
  } catch (error) {
    console.error('Part URL error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
