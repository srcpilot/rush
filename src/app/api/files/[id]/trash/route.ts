import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const POST = withAuth(async (req: NextRequest, context: any) => {
  const { id } = context.params;
  const userId = (req as any).user.id;

  // 1. Fetch file metadata from D1
  // SELECT * FROM files WHERE id = ? AND userId = ?

  // Mock finding the file
  const file = {
    id,
    r2Key: `user_123/${id}/file.txt`,
    name: "file.txt"
  };

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    // 2. Perform soft delete (status = 'trashed')
    // UPDATE files SET status = 'trashed', updatedAt = CURRENT_TIMESTAMP WHERE id = ?

    return NextResponse.json({ message: "File moved to trash" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to trash file" }, { status: 500 });
  }
});

export const PUT = withAuth(async (req: NextRequest, context: any) => {
  const { id } = context.params;
  const userId = (req as any).user.id;

  // 1. Fetch file metadata
  // SELECT * FROM files WHERE id = ? AND userId = ?

  // 2. Restore status
  // UPDATE files SET status = 'active', updatedAt = CURRENT_TIMESTAMP WHERE id = ?

  return NextResponse.json({ message: "File restored" });
});

export const DELETE = withAuth(async (req: NextRequest, context: any) => {
  const { id } = context.params;
  const userId = (req as any).user.id;

  // 1. Fetch file metadata to get r2Key
  // SELECT r2Key FROM files WHERE id = ? AND userId = ?

  const r2Key = `user_123/${id}/file.txt`; // Mock

  try {
    // 2. Delete from R2
    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${(req as any).env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: (req as any).env.R2_ACCESS_KEY_ID,
        secretAccessKey: (req as any).env.R2_SECRET_ACCESS_KEY,
      },
    });
    await s3Client.send(new DeleteObjectCommand({
      Bucket: (req as any).env.R2_BUCKET_NAME,
      Key: r2Key,
    }));

    // 3. Delete from D1
    // DELETE FROM files WHERE id = ?

    return NextResponse.json({ message: "File permanently deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
});
