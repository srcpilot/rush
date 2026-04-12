import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { KV_NAMESPACE } from '@/lib/kv';
import { db } from '@/lib/db'; // D1/Postgres client
import { S3Client, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { uploadId, parts } = await req.json(); // parts: [{partNumber, etag}]

    const kvKey = `upload:${uploadId}`;
    const kvData = await KV_NAMESPACE.get(kvKey);
    if (!kvData) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    const metadata = JSON.parse(kvData);
    const { r2Key, userId, fileName, fileSize, mimeType } = metadata;

    // 1. Complete Multipart Upload in R2
    const s3 = new S3Client({ /* R2 config */ });
    await s3.send(new CompleteMultipartUploadCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
      UploadId: metadata.uploadId,
      MultipartUpload: {
        Parts: parts.map((p: any) => ({ ETag: p.etag, PartNumber: p.partNumber }))
      }
    }));

    // 2. Create file record in D1
    const fileRecord = await db.insert(filesTable).values({
      name: fileName,
      size: fileSize,
      mimeType: mimeType,
      r2Key: r2Key,
      userId: userId,
      createdAt: new Date()
    }).returning();

    // 3. Update user storage used
    await db.update(usersTable)
      .set({ storage_used: sql`storage_used + ${fileSize}` })
      .where(eq(usersTable.id, userId));

    // 4. Cleanup KV
    await KV_NAMESPACE.delete(kvKey);

    return NextResponse.json({ success: true, file: fileRecord[0] });
  } catch (error) {
    console.error('Complete upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
