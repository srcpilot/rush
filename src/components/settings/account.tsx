"use client";

import React, { useState, useEffect } from 'react';

interface AccountData {
  name: string;
  email: string;
  avatarUrl: string;
}

export default function AccountSection() {
  const [data, setData] = useState<AccountData>({
    name: '',
    email: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch('/api/settings/account');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch account", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAccount();
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      avatarUrl: formData.get('avatarUrl') as string,
    };

    try {
      const res = await fetch('/api/settings/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update account');

      const updated = await res.json();
      setData(prev => ({ ...prev, ...updated }));
    } catch (err) {
      setError('Error updating account details.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-[#888]">Loading account...</div>;

  return (
    <div className="space-y-8">
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#262626] border border-[#d4af37] overflow-hidden flex items-center justify-center">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-[#d4af37]">
                {data.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <p className="text-sm text-[#888]">Update your avatar URL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#888]">Full Name</label>
            <input
              name="name"
              type="text"
              defaultValue={data.name}
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 focus:outline-none focus:border-[#d4af37] text-[#f5f5f0]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#888]">Email Address</label>
            <input
              type="email"
              value={data.email}
              disabled
              className="w-full bg-[#1a1a1a] border border-[#262626] rounded-md px-4 py-2 text-[#888] cursor-not-allowed"
            />
            <p className="text-xs text-[#555] mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#888]">Avatar URL</label>
            <input
              name="avatarUrl"
              type="text"
              defaultValue={data.avatarUrl}
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 focus:outline-none focus:border-[#d4af37] text-[#f5f5f0]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="bg-[#d4af37] text-[#0a0a0a] font-semibold px-6 py-2 rounded-md hover:bg-[#e5c158] transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <hr className="border-[#262626]" />

      <div className="space-y-6">
        <h3 className="text-lg font-medium">Security</h3>
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#262626] max-w-md">
          <h4 className="font-medium mb-4">Change Password</h4>
          <form className="space-y-4">
            <div>
              <label className="block text-xs text-[#888] uppercase mb-1">Current Password</label>
              <input type="password" className="w-full bg-[#0a0a0a] border border-[#262626] rounded px-3 py-2 focus:outline-none focus:border-[#d4af37]" />
            </div>
            <div>
              <label className="block text-xs text-[#888] uppercase mb-1">New Password</label>
              <input type="password" className="w-full bg-[#0a0a0a] border border-[#262626] rounded px-3 py-2 focus:outline-none focus:border-[#d4af37]" />
            </div>
            <div>
              <label className="block text-xs text-[#888] uppercase mb-1">Confirm New Password</label>
              <input type="password" className="w-full bg-[#0a0a0a] border border-[#262626] rounded px-3 py-2 focus:outline-none focus:border-[#d4af37]" />
            </div>
            <button type="button" className="text-sm text-[#d4af37] hover:underline">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
