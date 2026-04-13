'use client';

import { useState, FormEvent } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface Share {
  id: string;
  requires_password: boolean;
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

interface PasswordFormProps {
  token: string;
  onUnlock: (data: ShareData) => void;
}

export function PasswordForm({ token, onUnlock }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shares/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.status === 401) {
        throw new Error('Incorrect password');
      }

      if (!res.ok) {
        throw new Error('An error occurred while unlocking');
      }

      const data: ShareData = await res.json();
      onUnlock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl p-8 max-w-md mx-auto shadow-2xl w-full">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="p-4 bg-[#1a1a1a] rounded-full">
          <Lock className="w-8 h-8 text-[#d4a853]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-[#fafaf5] text-xl font-semibold">
            Password Protected
          </h2>
          <p className="text-[#a3a3a0] text-sm">
            This file is protected. Please enter the password to access it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-[#fafaf5] focus:outline-none focus:border-[#d4a853] transition-colors"
              autoFocus
              required
            />
            {error && (
              <p className="text-red-500 text-xs text-left px-1">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#d4a853] hover:bg-[#b89445] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Unlock File'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
