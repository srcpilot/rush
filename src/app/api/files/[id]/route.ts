import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/files/presign";

export const GET = withAuth(async (req: NextRequest, context: any) => {
  const { id } = context.params;
  const userId = (req as any).user.id;

  // 1. Fetch file from D1
  // SELECT * FROM files WHERE id = ? AND userId = ?

  // Mocking finding a file
  const file = {
    id,
    name: "example.pdf",
    r2Key: `user_123/${id}/example.pdf`,
    mimeType: "application/pdf"
  };

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const url = await getPresignedDownloadUrl((req as any).env, file.r2Key);
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
});
