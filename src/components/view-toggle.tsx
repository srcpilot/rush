"use client";

import React, { useState } from "react";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-[#2a2a2a]">
      <button
        onClick={() => setView("grid")}
        className={`p-1.5 rounded-md transition-colors ${
          view === "grid" ? "bg-[#2a2a2a] text-[#d4a843]" : "text-gray-500"
        }`}
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-1.5 rounded-md transition-colors ${
          view === "list" ? "bg-[#2a2a2a] text-[#d4a843]" : "text-gray-500"
        }`}
      >
        <List size={18} />
      </button>
    </div>
  );
}
