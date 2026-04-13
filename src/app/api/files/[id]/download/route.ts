import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getFile } from '@/lib/db';
import { streamFile } from '@/lib/r2';

type RouteParams = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  const id = parseInt(params.id, 10);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const file = await getFile(env.DB, id);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (file.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await streamFile(env.STORAGE, file.r2_key);

    if (!result) {
      return NextResponse.json({ error: 'File data not found' }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': result.size.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
