"use client";

import React, { useState, useEffect } from 'react';

interface StorageBreakdown {
  type: string;
  bytes: number;
  count: number;
}

interface StorageData {
  used: number;
  limit: number;
  breakdown: StorageBreakdown[];
}

export default function StorageSection() {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStorage() {
      try {
        const res = await fetch('/api/settings/storage');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch storage", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStorage();
  }, []);

  if (loading) return <div className="text-[#888]">Loading storage usage...</div>;
  if (!data) return <div className="text-red-500">Failed to load storage information.</div>;

  const usedGB = (data.used / (1024 ** 3)).toFixed(2);
  const limitGB = (data.limit / (1024 ** 3)).toFixed(2);
  const percentage = (data.used / data.limit) * 100;

  return (
    <div className="space-y-10">
      <section>
        <h3 className="text-lg font-medium mb-4">Storage Usage</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[#888]">{usedGB} GB used of {limitGB} GB</span>
            <span className="text-[#d4af37]">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-4 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#262626]">
            <div 
              className="h-full bg-[#d4af37] transition-all duration-500 ease-out"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-medium mb-6">Breakdown by Type</h3>
        <div className="space-y-4">
          {data.breakdown.length > 0 ? (
            data.breakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#d4af37]" />
                  <span className="capitalize text-[#f5f5f0]">{item.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#f5f5f0]">
                    {(item.bytes / (1024 ** 2)).toFixed(2)} MB
                  </div>
                  <div className="text-xs text-[#555]">{item.count} files</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#555] italic">No files uploaded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
