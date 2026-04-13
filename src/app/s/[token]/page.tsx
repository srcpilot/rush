'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PasswordForm } from '@/components/share/password-form';
import { FilePreview } from '@/components/share/file-preview';

interface Share {
  id: string;
  requires_password: boolean;
  // other share fields if needed
}

interface RushFile {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  upload_date: string;
  download_count: number;
}

interface ShareData {
  share: Share;
  file: RushFile;
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    async function fetchShare() {
      try {
        setLoading(true);
        const res = await fetch(`/api/shares/${token}`);
        
        if (res.status === 401) {
          setRequiresPassword(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch share information');
        }

        const data = await res.json();
        // The API response structure is assumed to be { share, file }
        // or if it's a password protected share, it might return 401
        // but if it returns 200 with requires_password: true, we handle it.
        
        if (data.share?.requires_password) {
          setRequiresPassword(true);
        } else {
          setShareData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchShare();
  }, [token]);

  const handleUnlock = (data: ShareData) => {
    setShareData(data);
    setRequiresPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#fafaf5]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (requiresPassword || !shareData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <PasswordForm token={token} onUnlock={handleUnlock} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      <FilePreview 
        share={shareData.share} 
        file={shareData.file} 
        token={token} 
      />
    </div>
  );
}
