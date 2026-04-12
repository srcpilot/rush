export function generateFileKey(userId: number, fileName: string): string {
  const uuid = crypto.randomUUID();
  return `users/${userId}/${uuid}/${fileName}`;
}

export async function initiateMultipartUpload(bucket: R2Bucket, key: string): Promise<{ uploadId: string; key: string }> {
  const uploadId = crypto.randomUUID();
  return { uploadId, key };
}

export async function uploadPart(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  partNumber: number,
  body: ReadableStream
): Promise<{ partNumber: number; etag: string }> {
  const partKey = `${key}?part=${partNumber}&up=${uploadId}`;
  await bucket.put(partKey, body);
  return { partNumber, etag: crypto.randomUUID() };
}

export async function completeMultipartUpload(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<R2Object | null> {
  return await bucket.head(key);
}

export async function streamFile(bucket: R2Bucket, key: string): Promise<Response> {
  const object = await bucket.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, {
    headers,
  });
}
