"use client";

import React, { useState } from 'react';

export default function DangerZone() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    
    // In a real app, this would call an API
    // For the sake of this task, we simulate a delay and success
    setTimeout(() => {
      setIsDeleting(false);
      setShowConfirmModal(false);
      setStatus('success');
      setEmailConfirm('');
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div className="bg-[#1a1a1a] border border-[#262626] p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Account Deleted</h2>
        <p className="text-[#888]">Your account and all associated data have been permanently removed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section>
        <h3 className="text-lg font-medium text-red-500 mb-6">Delete Account</h3>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 max-w-md">
          <p className="text-sm text-[#888] mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-2 px-4 bg-red-600/10 text-red-500 border border-red-600/20 rounded hover:bg-red-600 hover:text-white transition-all duration-200 font-medium"
          >
            Delete my account
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-6">Data Export</h3>
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-6 max-w-md opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#f5f5f0]">Export all your data</p>
              <p className="text-xs text-[#888]">Download a JSON archive of all your content.</p>
            </div>
            <span className="text-[10px] bg-[#262626] px-2 py-1 rounded text-[#888] uppercase">Coming Soon</span>
          </div>
        </div>
      </section>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1a1a1a] border border-red-900/50 rounded-lg p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Account Deletion</h2>
            <p className="text-[#888] text-sm mb-6">
              To confirm, please re-type your email address below.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded px-4 py-2 focus:outline-none focus:border-red-500 text-[#f5f5f0]"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 bg-[#262626] text-[#f5f5f0] rounded hover:bg-[#333] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !emailConfirm}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
