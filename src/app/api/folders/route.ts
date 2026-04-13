import { getCloudflareContext } from 'cloudflare:workers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { listFolders, createFolder } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parent_id');

  try {
    const folders = await listFolders(env.DB, user.id, parentId ? parseInt(parentId) : null);
    return NextResponse.json({ data: folders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const user = await getAuthUser(request, env);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, parent_id } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    // In a real implementation, we would resolve the path and depth here.
    // For this task, we assume createFolder handles the logic or we pass the necessary context.
    const folder = await createFolder(env.DB, user.id, name, parent_id ? parseInt(parent_id) : null);
    
    return NextResponse.json({ data: folder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
