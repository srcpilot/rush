'use client';

import React from 'react';

interface FileInfoProps {
  file: {
    name: string;
    size: number;
    mimeType: string;
    createdAt: string;
    modifiedAt: string;
    owner: string;
  };
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileInfo({ file }: FileInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 truncate" title={file.name}>
          {file.name}
        </h2>
        <p className="text-sm text-gray-500 capitalize">
          {file.mimeType.split('/')[1] || 'file'}
        </p>
      </div>

      <div className="space-y-2 text-sm border-t pt-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Size</span>
          <span className="text-gray-900 font-medium">{formatSize(file.size)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Owner</span>
          <span className="text-gray-900 font-medium">{file.owner}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Created</span>
          <span className="text-gray-900 font-medium">
            {new Date(file.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Modified</span>
          <span className="text-gray-900 font-medium">
            {new Date(file.modifiedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
