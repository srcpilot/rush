import { R2Bucket, R2MultipartUpload, R2UploadedPart } from '@cloudflare/workers-types';

/**
 * Generates a unique file key following the pattern:
 * uploads/{userId}/{timestamp}-{uuid}/{filename}
 */
export function generateFileKey(userId: number, filename: string): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  return `uploads/${userId}/${timestamp}-${uuid}/${filename}`;
}

/**
 * Initiates a multipart upload in R2.
 */
export async function createMultipartUpload(
  bucket: R2Bucket,
  key: string,
  contentType: string
): Promise<{ uploadId: string; key: string }> {
  const upload = await bucket.createMultipartUpload(key, {
    httpMetadata: { contentType },
  });
  return {
    uploadId: upload.uploadId,
    key: upload.key,
  };
}

/**
 * Uploads a single part of a multipart upload.
 */
export async function uploadPart(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  partNumber: number,
  body: ReadableStream | ArrayBuffer
): Promise<R2UploadedPart> {
  const upload = await bucket.getMultipartUpload(key, uploadId);
  const part = await upload.uploadPart(partNumber, body);
  return part;
}

/**
 * Completes a multipart upload.
 */
export async function completeMultipartUpload(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  parts: R2UploadedPart[]
): Promise<void> {
  const upload = await bucket.getMultipartUpload(key, uploadId);
  await upload.complete(parts);
}

/**
 * Aborts a multipart upload.
 */
export async function abortMultipartUpload(
  bucket: R2Bucket,
  key: string,
  uploadId: string
): Promise<void> {
  const upload = await bucket.getMultipartUpload(key, uploadId);
  await upload.abort();
}

/**
 * Streams a file from R2.
 * Returns null if the object is not found.
 */
export async function streamFile(
  bucket: R2Bucket,
  key: string
): Promise<{ stream: ReadableStream; size: number; contentType: string } | null> {
  const object = await bucket.get(key);
  if (!object) {
    return null;
  }

  return {
    stream: object.body!,
    size: object.size,
    contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
  };
}
