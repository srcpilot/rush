import React from "react";
import Link from "next/link";

export default function Breadcrumbs() {
  // In a real app, these would be derived from the current path or fetched via API
  const path = [
    { label: "Rush", href: "/dashboard" },
    { label: "Folder", href: "/dashboard/folder/1" },
  ];

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500">
      {path.map((item, index) => (
        <React.Fragment key={item.href}>
          <Link
            href={item.href}
            className="hover:text-[#d4a843] transition-colors"
          >
            {item.label}
          </Link>
          {index < path.length - 1 && (
            <span className="text-gray-700">/</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
