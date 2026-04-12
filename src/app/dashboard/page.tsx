import React from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import ViewToggle from "@/components/view-toggle";
import FileGrid from "@/components/file-grid";
import FileList from "@/components/file-list";

export default async function DashboardPage() {
  // In a real app, fetch data from an API or DB here
  // For now, we use mock data to demonstrate the UI
  const files = [
    { id: "1", name: "Project_Specs.pdf", type: "pdf", size: "2.4 MB", modified: "2h ago" },
    { id: "2", name: "Brand_Assets.zip", type: "zip", size: "45.0 MB", modified: "1d ago" },
    { id: "3", name: "Invoice_Aug.png", type: "image", size: "1.2 MB", modified: "3d ago" },
    { id: "4", name: "Meeting_Notes.txt", type: "text", size: "12 KB", modified: "5d ago" },
    { id: "5", name: "Budget_2024.xlsx", type: "sheet", size: "850 KB", modified: "1w ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumbs />
        <ViewToggle />
      </div>

      <div className="space-y-4">
        {/* Note: In a real implementation, the view mode (grid vs list) 
            would be managed via a shared state provider or URL params.
            For this demo, we'll show both or choose one. */}
        <FileGrid files={files} />
        <div className="mt-8">
          <FileList files={files} />
        </div>
      </div>
    </div>
  );
}
