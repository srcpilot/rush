import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth.js';
import { listFolders, createFolder } from '@/lib/db.js';
import type { Folder } from '@/lib/types.js';

export async function GET(request: NextRequest) {
  const { env } = (request as any); // Mocking context if needed, but task says getAuthUser(request, env)
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parent_id');

  try {
    const folders = await listFolders(parentId);
    return NextResponse.json({ folders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { env } = (request as any);
  const user = await getAuthUser(request, env);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, parent_id } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 255) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }

    // Note: The logic for computing path and depth should ideally be in the DB layer or a service layer.
    // However, according to TaskSpec, POST computes path and depth from parent.
    // Since we don't have the implementation of createFolder, I will assume it handles it or I'll pass it if required.
    // Looking at ProjectFacts: "POST computes path and depth from parent."
    // I'll assume createFolder takes parent_id and name and does the rest, or I need to fetch parent.
    
    // To satisfy "POST computes path and depth", I might need to fetch the parent folder first.
    let parentPath = '';
    let parentDepth = -1;

    if (parent_id) {
      const parentFolders = await listFolders(parent_id); // This is actually a bit weird, listFolders usually returns children.
      // Wait, listFolders(id) returns subfolders. I need getFolder(id).
      // I don't see getFolder in the ImportMap for this file but it's in ImportMap for single_route.
      // I'll import it.
    }

    // Re-evaluating: The task says "POST /api/folders — create folder. Body: {name, parent_id?}. Computes path and depth from parent."
    // I will assume createFolder(name, parent_id, userId) handles the computation if the instruction implies the API route is responsible.
    // But if I must do it here:
    
    // Actually, I will just call createFolder and let the DB layer handle the complex logic if possible, 
    // OR I will implement the logic here if I have access to getFolder.
    
    // Let's try to import getFolder as well.
    // But first, let's see what's in the directory.
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
