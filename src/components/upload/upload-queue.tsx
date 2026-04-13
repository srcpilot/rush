import React, { useState, useEffect } from 'react';
import { UploadItem } from './upload-item';
import { useUploadManager } from '@/hooks/use-upload-manager';

export function UploadQueue() {
  const { queue, addFiles } = useUploadManager();

  if (queue.length === 0) {
    return (
      <div className="text-center py-12 border border-[#262626] rounded-xl bg-[#141414]">
        <p className="text-[#a3a3a0]">No active uploads</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((item) => (
        <UploadItem key={item.id} item={item} />
      ))}
    </div>
  );
}
