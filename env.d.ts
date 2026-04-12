/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  STORAGE: R2Bucket;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
}

declare module "cloudflare:workers" {
  function getCloudflareContext<E = Env>(): { env: E };
}
