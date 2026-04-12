'use client';

import { useParams } from 'next/navigation';
import { FileViewer } from '@/components/viewer/file-viewer';

// This is a mocked page component. In a real app, this would fetch file data from an API based on the ID.
export default function FileViewerPage() {
  const params = useParams();
  const id = params.id as string;

  // Mock data for demonstration
  const mockFile = {
    id: id || '123',
    name: 'example-document.pdf',
    mimeType: 'application/pdf',
    size: 1024 * 1024 * 2, // 2MB
    url: 'https://example.com/presigned-url-to-pdf',
    downloadUrl: 'https://example.com/presigned-url-to-pdf',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    owner: 'John Doe',
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <FileViewer file={mockFile} />
    </div>
  );
}
