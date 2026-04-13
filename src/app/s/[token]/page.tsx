'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import FilePreview from '@/components/share/file-preview';
import PasswordForm from '@/components/share/password-form';
import type { RushFile } from '@/lib/types.js';

type Status = 'loading' | 'public' | 'password' | 'expired' | 'not_found' | 'error';

interface ShareData {
  access?: string;
  name?: string;
  size?: number;
  mimeType?: string;
  file?: RushFile;
}

export default function SharePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [status, setStatus] = useState<Status>('loading');
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/shares/${token}`);
        if (res.status === 410 || res.status === 404) {
          setStatus('expired');
          return;
        }
        if (!res.ok) {
          setStatus('error');
          return;
        }
        const data = await res.json() as ShareData;
        setShareData(data);
        setStatus(data.access === 'password' ? 'password' : 'public');
      } catch {
        setStatus('error');
      }
    }
    if (token) fetchShare();
  }, [token]);

  const handlePasswordSubmit = async (password: string) => {
    try {
      const res = await fetch(`/api/shares/${token}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Incorrect password');
        }
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = shareData?.name ?? 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      throw err;
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (status === 'expired' || status === 'not_found') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold">Link Expired</h1>
          <p className="text-muted-foreground">This share link has expired and is no longer available.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">An error occurred while retrieving the share.</p>
        </div>
      </div>
    );
  }

  if (status === 'password') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <PasswordForm onSuccess={handlePasswordSubmit} error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {shareData?.name ?? 'Shared File'}
              </h1>
              <p className="text-muted-foreground">
                {shareData?.size ? `${(shareData.size / 1024 / 1024).toFixed(2)} MB` : 'File'}
              </p>
            </div>
            {shareData?.file && <FilePreview file={shareData.file} />}
          </div>
        </div>
      </main>
    </div>
  );
}
