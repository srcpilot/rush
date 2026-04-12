import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { FolderService } from '@/lib/folders';

const folderService: FolderService = {} as any;

export const PATCH = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const folder = await folderService.rename(id, { name });
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rename folder' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    await folderService.delete(id);
    return NextResponse.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
});
