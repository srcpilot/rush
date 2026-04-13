"use client";

import Link from "next/link";

interface BreadcrumbProps {
  segments: Array<{ label: string; href: string }>;
}

export default function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {segments.map((segment, index) => (
        <div key={segment.href} className="flex items-center space-x-2">
          {index > 0 && <span className="text-[#a3a3a0]">/</span>}
          <Link
            href={segment.href}
            className={
              index === segments.length - 1
                ? "text-[#fafaf5] font-medium cursor-default"
                : "text-[#a3a3a0] hover:text-[#d4a853] transition-colors"
            }
          >
            {segment.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
