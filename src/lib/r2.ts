export function generateFileKey(userId: number, fileName: string): string {
  const uuid = crypto.randomUUID();
  return `users/${userId}/${uuid}/${fileName}`;
}

// Alias used by generated routes
export const generateR2Key = generateFileKey;

export async function initiateMultipartUpload(bucket: R2Bucket, key: string): Promise<{ uploadId: string; key: string }> {
  const uploadId = crypto.randomUUID();
  return { uploadId, key };
}

// Env-based wrapper used by generated routes
export async function createMultipartUpload(env: Env, key: string): Promise<{ uploadId: string; key: string }> {
  return initiateMultipartUpload(env.STORAGE, key);
}

export async function uploadPart(
  bucket: R2Bucket,
  key: string,
  uploadId: string,
  partNumber: number,
  body: ReadableStream | ArrayBuffer
): Promise<{ partNumber: number; etag: string }> {
  const partKey = `${key}?part=${partNumber}&up=${uploadId}`;
  await bucket.put(partKey, body);
  return { partNumber, etag: crypto.randomUUID() };
}

export async function completeMultipartUpload(
  bucket: R2Bucket | Env,
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<R2Object | null> {
  const b = (bucket as Env).STORAGE ?? (bucket as R2Bucket);
  return await b.head(key);
}

export async function abortMultipartUpload(env: Env, key: string, uploadId: string): Promise<void> {
  // R2 multipart uploads: delete any staged part keys
  const partPrefix = `${key}?part=`;
  const listed = await env.STORAGE.list({ prefix: partPrefix });
  await Promise.all(listed.objects.map(obj => env.STORAGE.delete(obj.key)));
}

export async function getObject(bucket: R2Bucket, key: string): Promise<R2ObjectBody> {
  const object = await bucket.get(key);
  if (!object) {
    throw new Error(`Object not found: ${key}`);
  }
  return object;
}

export async function deleteObject(env: Env, key: string): Promise<void> {
  await env.STORAGE.delete(key);
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
