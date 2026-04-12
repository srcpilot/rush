import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/files/presign";

export const GET = withAuth(async (req: NextRequest, context: any) => {
  const { id } = context.params;
  
  // In a real app, we'd fetch file metadata from D1 first
  // For now, we simulate finding a file
  const file = {
    id,
    r2Key: `user_123/${id}/some_file.dat`
  };

  try {
    const downloadUrl = await getPresignedDownloadUrl((req as any).env, file.r2Key);
    return NextResponse.redirect(downloadUrl);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
