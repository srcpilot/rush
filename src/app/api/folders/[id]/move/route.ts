import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { FolderService } from '@/lib/folders';

const folderService: FolderService = {} as any;

export const POST = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { parentId } = body;

    if (parentId === id) {
      return NextResponse.json({ error: 'Cannot move folder into itself' }, { status: 400 });
    }

    // Note: A real implementation would check for circular references 
    // by checking if the new parent is a descendant of the current folder.

    const folder = await folderService.move(id, { parentId: parentId || null });
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to move folder' }, { status: 500 });
  }
});
