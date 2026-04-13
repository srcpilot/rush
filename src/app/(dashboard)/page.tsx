'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileCard } from '@/components/file-card';
import { FolderCard } from '@/components/folder-card';
import { EmptyState } from '@/components/empty-state';
import { Breadcrumb } from '@/components/breadcrumb';

interface RushFile {
  id: number;
  name: string;
  size: number;
  type: string;
  updated_at: string;
}

interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  updated_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [files, setFiles] = useState<RushFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  const currentFolderIdParam = searchParams.get('folder');
  
  useEffect(() => {
    if (currentFolderIdParam) {
      setCurrentFolderId(Number(currentFolderIdParam));
    } else {
      setCurrentFolderId(null);
    }
  }, [currentFolderIdParam]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [foldersRes, filesRes] = await Promise.all([
          fetch(`/api/folders?parent_id=${currentFolderId ?? ''}`),
          fetch(`/api/files?folder_id=${currentFolderId ?? ''}`)
        ]);

        if (foldersRes.ok) {
          const foldersData = await foldersRes.json();
          setFolders(foldersData);
        }

        if (filesRes.ok) {
          const filesData = await filesRes.json();
          setFiles(filesData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, currentFolderId, router]);

  // Simple breadcrumb logic for now - in a real app this would fetch the path
  const breadcrumbSegments = [
    { label: 'Home', href: '/dashboard' },
    ...(currentFolderId ? [{ label: 'Folder', href: `?folder=${currentFolderId}` }] : [])
  ];

  if (authLoading) {
    return <div className="p-8 text-[#a3a3a0]">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Breadcrumb segments={breadcrumbSegments} />
        <button 
          className="px-4 py-2 bg-[#d4a853] text-[#0a0a0a] rounded-md font-medium hover:opacity-90 transition-opacity"
          onClick={() => {/* Trigger UploadZone modal (Phase 2) */}}
        >
          Upload
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-[#a3a3a0]">
          Loading content...
        </div>
      ) : (
        <>
          {folders.length > 0 && (
            <section>
              <h2 className="text-[#fafaf5] text-lg font-medium mb-4">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <FolderCard 
                    key={folder.id} 
                    folder={folder} 
                    onClick={() => router.push(`/dashboard?folder=${folder.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section>
              <h2 className="text-[#fafaf5] text-lg font-medium mb-4">Files</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            </section>
          )}

          {(folders.length === 0 && files.length === 0) && (
            <EmptyState />
          )}
        </>
      )}
    </div>
  );
}
