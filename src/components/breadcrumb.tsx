'use client';

import Link from 'next/link';

interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center space-x-2">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <li key={segment.href} className="flex items-center">
              {isLast ? (
                <span className="text-[#fafaf5] font-medium" aria-current="page">
                  {segment.label}
                </span>
              ) : (
                <>
                  <Link
                    href={segment.href}
                    className="text-[#a3a3a0] hover:text-[#fafaf5] transition-colors"
                  >
                    {segment.label}
                  </Link>
                  <span className="mx-2 text-[#a3a3a0]">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
