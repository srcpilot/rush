import { cn } from "./utils";

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getMimeCategory(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/') || mimeType === 'application/json' || mimeType === 'application/javascript') return 'text';
  if (mimeType.includes('pdf')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  return 'other';
}

export async function buildFolderPath(db: D1Database, folderId: number): Promise<string> {
  const rows = await db.prepare(
    `WITH RECURSIVE path_cte AS (
      SELECT id, name, parent_id, 0 as level
      FROM folders
      WHERE id = ?
      UNION ALL
      SELECT f.id, f.name, f.parent_id, p.level + 1
      FROM folders f
      JOIN path_cte p ON f.id = p.parent_id
    )
    SELECT name FROM path_cte ORDER BY level DESC`
  ).bind(folderId).all();

  if (!rows.results || rows.results.length === 0) return '/';
  
  const names = (rows.results as any[]).map(row => row.name);
  return '/' + names.join('/');
}

export function generateToken(): string {
  return crypto.randomUUID();
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}
