import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { FolderService } from '@/lib/folders';

const folderService: FolderService = {} as any;

export const GET = withAuth(async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const breadcrumbs = await folderService.getBreadcrumbs(id);
    return NextResponse.json(breadcrumbs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch breadcrumbs' }, { status: 500 });
  }
});
