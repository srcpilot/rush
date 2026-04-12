import React from "react";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Folder: {id}</h1>
      <p className="text-gray-500">Viewing contents of folder {id}</p>
      {/* Implementation would follow the dashboard pattern */}
    </div>
  );
}
