import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/files/presign";
import { crypto } from "crypto"; // Mocking ID generation for the example

export const POST = withAuth(async (req: NextRequest) => {
  const { filename, contentType, folderId } = await req.json();
  const userId = (req as any).user.id;
  const fileId = crypto.randomUUID(); // In reality, use a more robust ID generator
  
  const r2Key = `${userId}/${folderId || "root"}/${fileId}/${filename}`;

  try {
    const uploadUrl = await getPresignedUploadUrl((req as any).env, r2Key, contentType);

    // In real app:
    // INSERT INTO files (id, name, size, mimeType, r2Key, folderId, userId, status, createdAt, updatedAt)
    // VALUES (?, ?, 0, ?, ?, ?, ?, 'active', ?, ?)

    return NextResponse.json({
      uploadUrl,
      fileId,
      r2Key
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize upload" }, { status: 500 });
  }
});
