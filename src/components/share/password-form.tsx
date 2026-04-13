'use client';

import { useState, FormEvent } from 'react';
import type { Share, RushFile } from '@/lib/types.js';

interface PasswordFormProps {
  token: string;
  onUnlock: (data: { share: Share; file: RushFile }) => void;
}

export default function PasswordForm({ token, onUnlock }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/shares/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        onUnlock(data);
      } else if (res.status === 401) {
        setError('Incorrect password');
      } else {
        setError('An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#141414] border border-[#262626] rounded-xl mx-auto mt-16 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-[#1a1a1a] border border-[#262626] rounded-full text-2xl">
          🔒
        </div>
        <h2 className="text-2xl font-bold text-[#fafaf5]">Password Protected</h2>
        <p className="text-[#a3a3a0] mt-2">Please enter the password to access this file.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded text-[#fafaf5] focus:outline-none focus:border-[#d4a853] transition-colors"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="w-full py-3 bg-[#d4a853] hover:bg-[#c2964a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold rounded transition-colors"
        >
          {isSubmitting ? 'Verifying...' : 'Unlock File'}
        </button>
      </form>
    </div>
  );
}

import React, { useState } from 'react';

interface PasswordFormProps {
  onSuccess: (password: string) => void;
  error?: string | null;
}

export default function PasswordForm({ onSuccess, error }: PasswordFormProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSuccess(password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-[#141414] border border-[#262626] rounded-lg shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-[#1a1a1a] border border-[#262626] rounded-full text-2xl">
          🔒
        </div>
        <h2 className="text-2xl font-bold text-[#fafaf5]">Password Protected</h2>
        <p className="text-[#a3a3a0] mt-2">Please enter the password to access this file.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded text-[#fafaf5] focus:outline-none focus:border-[#d4a853] transition-colors"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="w-full py-3 bg-[#d4a853] hover:bg-[#c2964a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold rounded transition-colors"
        >
          {isSubmitting ? 'Verifying...' : 'Unlock File'}
        </button>
      </form>
    </div>
  );
}
