import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { FolderService } from '@/lib/folders';

// Note: In a real implementation, FolderService would be injected or retrieved via a container.
// For the purpose of this task, we assume a global or singleton instance.
const folderService: FolderService = {} as any; 

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const parentId = searchParams.get('parent_id');
  
  try {
    const folders = await folderService.list(parentId || null);
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, parentId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Prevent circular reference if parentId is same as current? 
    // (Not applicable on create, but relevant for move)

    const folder = await folderService.create({ name, parentId: parentId || null });
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
});
