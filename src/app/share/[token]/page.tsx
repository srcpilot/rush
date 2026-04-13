import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Share, RushFile } from '@/lib/types.js';
import FilePreview from '@/components/share/file-preview';
import PasswordGate from '@/components/share/password-gate';

type Status = 'loading' | 'password_required' | 'ready' | 'expired' | 'error';

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [share, setShare] = useState<Share | null>(null);
  const [file, setFile] = useState<RushFile | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/shares/${token}`);
        if (!res.ok) {
          if (res.status === 404 || res.status === 410) {
            setStatus('expired');
            return;
          }
          throw new Error('Failed to fetch share');
        }
        const data: Share = await res.json();
        setShare(data);
        setFile(data.file);
        
        if (data.isPasswordProtected) {
          setStatus('password_required');
        } else {
          setStatus('ready');
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setStatus('error');
      }
    }

    if (token) {
      fetchShare();
    }
  }, [token]);

  const handleDownload = async (password?: string) => {
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
      a.download = file?.name || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      if (err instanceof Error && err.message === 'Incorrect password') {
        setStatus('password_required');
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#fafaf5]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#fafaf5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-[#a3a3a0]">{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-[#fafaf5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-[#a3a3a0]">This share link is no longer valid.</p>
        </div>
      </div>
    );
  }

  if (status === 'password_required') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <PasswordGate 
          onSuccess={handleDownload} 
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafaf5] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#fafaf5]">{file?.name || 'Shared File'}</h1>
            <p className="text-[#a3a3a0] text-sm">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
            </p>
          </div>
          <button
            onClick={() => handleDownload()}
            className="px-6 py-2 bg-[#d4a853] hover:bg-[#c2964a] text-[#0a0a0a] font-semibold rounded transition-colors"
          >
            Download
          </button>
        </header>

        <main className="bg-[#141414] border border-[#262626] rounded-lg overflow-hidden">
          {file ? (
            <FilePreview file={file} />
          ) : (
            <div className="p-12 text-center text-[#a3a3a0]">
              No file information available.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
