import { useState, useCallback } from 'react';
import { uploadManager } from '@/lib/upload-manager';
import type { UploadItemState } from '@/lib/types.js';

export function useUploadQueue() {
  const [queue, setQueue] = useState<UploadItemState[]>([]);

  const addFiles = useCallback(async (files: File[]) => {
    const newItems: UploadItemState[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'queued',
      error: undefined
    }));

    setQueue(prev => [...prev, ...newItems]);

    for (const item of newItems) {
      // Start upload for each file
      uploadFile(item.id, item.file);
    }
  }, []);

  const uploadFile = async (id: string, file: File) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'uploading' } : item
    ));

    try {
      await uploadManager.uploadFile(file, undefined, (progress) => {
        setQueue(prev => prev.map(item => 
          item.id === id ? { ...item, progress } : item
        ));
      });

      setQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'complete', progress: 100 } : item
      ));
    } catch (error: any) {
      setQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'error', error: error.message } : item
      ));
    }
  };

  const retryUpload = async (id: string) => {
    const item = queue.find(i => i.id === id);
    if (item) {
      await uploadFile(id, item.file);
    }
  };

  return { queue, addFiles, retryUpload };
}
