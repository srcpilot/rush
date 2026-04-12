"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context.js';
import type { RushFile, Folder } from '@/lib/types.js';
import Breadcrumb from '@/components/breadcrumb.tsx';
import FolderCard from '@/components/folder-card.tsx';
import FileCard from '@/components/file-card.tsx';
import EmptyState from '@/components/empty-state.tsx';
import ContextMenu from '@/components/context-menu.tsx';

interface MenuTarget {
  id: string;
  type: 'file' | 'folder';
  x: number;
  y: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<RushFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null);
  
  const currentFolderId = searchParams.get("folder_id");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = currentFolderId 
        ? `/api/files?folder_id=${currentFolderId}` 
        : "/api/files";
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFolderClick = (folderId: string) => {
    router.push(`/(dashboard)?folder_id=${folderId}`);
  };

  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'file' | 'folder') => {
    e.preventDefault();
    setMenuTarget({ 
      id, 
      type, 
      x: e.clientX, 
      y: e.clientY 
    });
  };

  const closeMenu = useCallback(() => {
    setMenuTarget(null);
  }, []);

  useEffect(() => {
    const handleClick = () => closeMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [closeMenu]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-[#d4a853] animate-pulse">Loading your files...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" onContextMenu={(e) => e.preventDefault()}>
      <header className="space-y-4">
        <Breadcrumb />
      </header>

      <main className="space-y-8">
        {folders.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Folders</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {folders.map((folder) => (
                <div 
                  key={folder.id} 
                  onContextMenu={(e) => handleContextMenu(e, folder.id, 'folder')}
                >
                  <FolderCard 
                    folder={folder} 
                    onClick={() => handleFolderClick(folder.id)} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Files</h2>
          {files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  onContextMenu={(e) => handleContextMenu(e, file.id, 'file')}
                >
                  <FileCard file={file} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>

      {menuTarget && (
        <ContextMenu 
          target={menuTarget} 
          onClose={closeMenu}
        />
      )}
    </div>
  );
}
