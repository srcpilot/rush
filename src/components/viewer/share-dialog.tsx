'use client';

import React, { useState } from 'react';

interface ShareDialogProps {
  fileId: string;
}

export function ShareDialog({ fileId }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareResult, setShareResult] = useState<{ url: string } | null>(null);
  const [formData, setFormData] = useState({
    accessType: 'public',
    password: '',
    expiry: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          ...formData
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setShareResult({ url: data.shareUrl });
      } else {
        alert('Failed to create share link');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (shareResult?.url) {
      navigator.clipboard.writeText(shareResult.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition-colors"
      >
        Share
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share File</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {!shareResult ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Access Type</label>
                  <select
                    value={formData.accessType}
                    onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="public">Public</option>
                    <option value="password">Password Protected</option>
                  </select>
                </div>

                {formData.accessType === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Create Share Link'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Your shareable link is ready:</p>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                  <input
                    readOnly
                    value={shareResult.url}
                    className="bg-transparent text-sm w-full outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShareResult(null);
                    setFormData({ accessType: 'public', password: '', expiry: '' });
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Create another link
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
