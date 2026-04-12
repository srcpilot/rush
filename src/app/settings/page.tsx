import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#262626]">
          <p className="text-[#888] text-sm">General information about your account.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Storage Usage</h2>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#262626]">
          <p className="text-[#888] text-sm">Manage your uploaded files and data.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-red-500">Danger Zone</h2>
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#262626]">
          <p className="text-[#888] text-sm">Irreversible actions.</p>
        </div>
      </section>
    </div>
  );
}
