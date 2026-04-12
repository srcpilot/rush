import { useState, useCallback } from 'react';
import { useUpload } from '@/hooks/use-upload';

export type UploadStatus = 'idle' | 'uploading' | 'completed' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export function useUploadHook() {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'idle' as UploadStatus,
    }));
    setQueue((prev) => [...prev, ...newFiles]);
    // In a real implementation, this would trigger the upload process
  }, []);

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const retryItem = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'idle', progress: 0 } : item
      )
    );
  }, []);

  return { queue, isUploading, addFiles, removeItem, retryItem, setQueue };
}
