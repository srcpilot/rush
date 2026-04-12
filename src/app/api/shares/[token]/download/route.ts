import { NextRequest, NextResponse } from 'next/server';
import { streamFile } from '@/lib/r2.js';
import { getFile } from '@/lib/db.js';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params;

  try {
    // 1. Fetch share from DB
    // const share = await db.share.findUnique({ where: { token } });
    // if (!share) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    // 2. Expiry Check (ProjectFacts)
    // if (share.expires_at && new Date(share.expires_at) < new Date()) {
    //   return NextResponse.json({ error: 'Gone' }, { status: 410 });
    // }

    // 3. Download Limit Check (ProjectFacts)
    // if (share.max_downloads && share.downloads >= share.max_downloads) {
    //   return NextResponse.json({ error: 'Gone' }, { status: 410 });
    // }

    // 4. Increment download counter in DB
    // await db.share.update({ where: { id: share.id }, data: { downloads: { increment: 1 } } });

    // 5. Stream file
    // if (share.file_id) {
    //   const file = await getFile(share.file_id);
    //   const { stream, type, name } = await streamFile(file.r2_key);
    //   return new NextResponse(stream, {
    //     headers: {
    //       'Content-Type': type,
    //       'Content-Disposition': `attachment; filename="${name}"`,
    //     },
    //   });
    // }

    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });

  } catch (error) {
    console.error('Error downloading share:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
