import { NextRequest } from 'next/server';
import { UploadProgressEvent } from '@/lib/upload/progress';

// Note: In a real implementation, this would interact with KV or a database
// to track the upload progress. This is a skeleton demonstrating the SSE stream.

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  const { uploadId } = params;

  // 1. Check Authentication (Mock)
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: UploadProgressEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      const heartbeatInterval = setInterval(() => {
        sendEvent({ type: 'heartbeat', timestamp: Date.now() });
      }, 15000);

      const timeoutId = setTimeout(() => {
        clearInterval(heartbeatInterval);
        controller.close();
      }, 300000); // 5 minutes timeout

      try {
        let isFinished = false;

        while (!isFinished) {
          // 2. Poll KV/Database for status
          // Mocking progress for demonstration:
          const progress = await mockGetUploadProgress(uploadId);

          if (progress.status === 'done') {
            sendEvent({
              type: 'upload_complete',
              fileId: uploadId,
              fileName: 'mock-file.dat',
              totalBytes: progress.totalBytes,
            });
            isFinished = true;
          } else if (progress.status === 'failed') {
            sendEvent({
              type: 'upload_error',
              error: 'Upload failed unexpectedly',
            });
            isFinished = true;
          } else {
            // Send part progress
            sendEvent({
              type: 'part_complete',
              partNumber: progress.lastPartCompleted,
              totalParts: progress.totalParts,
              bytesUploaded: progress.uploadedBytes,
              totalBytes: progress.totalBytes,
              percent: (progress.uploadedBytes / progress.totalBytes) * 100,
            });
          }

          if (!isFinished) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      } catch (err) {
        sendEvent({ type: 'upload_error', error: (err as Error).message });
      } finally {
        clearInterval(heartbeatInterval);
        clearTimeout(timeoutId);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

interface MockProgress {
  status: 'uploading' | 'done' | 'failed';
  lastPartCompleted: number;
  totalParts: number;
  totalBytes: number;
  uploadedBytes: number;
}

async function mockGetUploadProgress(uploadId: string): Promise<MockProgress> {
  // This would actually be a KV read: await KV.get(`upload:${uploadId}`)
  return {
    status: 'uploading',
    lastPartCompleted: 1,
    totalParts: 5,
    totalBytes: 1000,
    uploadedBytes: 200,
  };
}
