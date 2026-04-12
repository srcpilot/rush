"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils.js";

interface BreadcrumbProps {
  pathSegments?: { name: string; id?: string }[];
}

export default function Breadcrumb({ pathSegments = [] }: BreadcrumbProps) {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folder_id");

  // Mocking path segments based on folder_id if not provided
  // In a real app, this would come from the API or state
  const segments = pathSegments.length > 0 ? pathSegments : (currentFolderId ? [{ name: "Current Folder", id: currentFolderId }] : []);

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link 
        href="/(dashboard)" 
        className="hover:text-[#d4a853] transition-colors"
      >
        My Files
      </Link>
      
      {segments.map((segment, index) => (
        <div key={segment.id || index} className="flex items-center space-x-2">
          <span className="text-muted-foreground/50">/</span>
          <Link
            href={segment.id ? `/(dashboard)?folder_id=${segment.id}` : "/(dashboard)"}
            className={cn(
              "hover:text-[#d4a853] transition-colors",
              index === segments.length - 1 && "text-gray-200 font-medium cursor-default"
            )}
          >
            {segment.name}
          </Link>
        </div>
      ))}
    </nav>
  );
}
