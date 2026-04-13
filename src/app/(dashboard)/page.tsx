'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { RushFile, Folder } from '@/lib/types';
import Breadcrumb from '@/components/breadcrumb';
import { FolderCard } from '@/components/folder-card';
import { FileCard } from '@/components/file-card';
import { EmptyState } from '@/components/empty-state';

interface ApiResponse {
  data?: {
    files?: RushFile[];
    folders?: Folder[];
  };
  files?: RushFile[];
  folders?: Folder[];
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<RushFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href: string }[]>([
    { label: 'My Files', href: '/' },
  ]);

  const currentFolderId = searchParams.get('folder_id');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = currentFolderId
        ? `/api/files?folder_id=${currentFolderId}`
        : '/api/files';

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const body = await response.json() as ApiResponse;
      const fetchedFiles = body.files ?? body.data?.files ?? [];
      const fetchedFolders = body.folders ?? body.data?.folders ?? [];

      setFolders(fetchedFolders);
      setFiles(fetchedFiles);

      const newBreadcrumbs: { label: string; href: string }[] = [
        { label: 'My Files', href: '/' },
      ];
      if (currentFolderId) {
        const currentFolder = fetchedFolders.find(
          (f) => String(f.id) === currentFolderId
        );
        newBreadcrumbs.push({
          label: currentFolder ? currentFolder.name : 'Folder',
          href: `/?folder_id=${currentFolderId}`,
        });
      }
      setBreadcrumbs(newBreadcrumbs);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFolderClick = (folderId: number) => {
    router.push(`/?folder_id=${folderId}`);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-[#d4a853] animate-pulse">Loading your files...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" onContextMenu={handleContextMenu}>
      <header className="space-y-4">
        <Breadcrumb segments={breadcrumbs} />
      </header>

      <main className="space-y-8">
        {folders.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-[#a3a3a0] mb-4 uppercase tracking-wider">
              Folders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onClick={handleFolderClick}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-medium text-[#a3a3a0] mb-4 uppercase tracking-wider">
            Files
          </h2>
          {files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          ) : (
            <EmptyState title="No files yet" description="Upload your first file to get started." />
          )}
        </section>
      </main>
    </div>
  );
}
