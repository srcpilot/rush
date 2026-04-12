import type { RushUser, RushFile, Folder, UploadSession } from './types.js';

export async function getUser(db: D1Database, id: number): Promise<RushUser | null> {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
}

export async function getUserByEmail(db: D1Database, email: string): Promise<RushUser | null> {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function createUser(db: D1Database, data: { email: string; name: string; password_hash: string }): Promise<RushUser> {
  return (await db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING *')
    .bind(data.email, data.name, data.password_hash)
    .first()) as RushUser;
}

export async function listFiles(db: D1Database, ownerId: number, folderId?: number | string | null): Promise<RushFile[]> {
  if (folderId) {
    return await db.prepare('SELECT * FROM files WHERE owner_id = ? AND folder_id = ?')
      .bind(ownerId, folderId)
      .all()
      .then(res => res.results as unknown as RushFile[]);
  }
  return await db.prepare('SELECT * FROM files WHERE owner_id = ?')
    .bind(ownerId)
    .all()
    .then(res => res.results as unknown as RushFile[]);
}

export async function listFolders(db: D1Database, ownerId: number, parentId?: number | null): Promise<Folder[]> {
  if (parentId) {
    return await db.prepare('SELECT * FROM folders WHERE owner_id = ? AND parent_id = ?')
      .bind(ownerId, parentId)
      .all()
      .then(res => res.results as unknown as Folder[]);
  }
  return await db.prepare('SELECT * FROM folders WHERE owner_id = ? AND parent_id IS NULL')
    .bind(ownerId)
    .all()
    .then(res => res.results as unknown as Folder[]);
}

export async function searchFiles(db: D1Database, ownerId: number, query: string, limit?: number): Promise<RushFile[]> {
  const sql = limit
    ? 'SELECT * FROM files WHERE owner_id = ? AND name MATCH ? LIMIT ?'
    : 'SELECT * FROM files WHERE owner_id = ? AND name MATCH ?';
  const stmt = limit
    ? db.prepare(sql).bind(ownerId, query, limit)
    : db.prepare(sql).bind(ownerId, query);
  return await stmt.all().then(res => res.results as unknown as RushFile[]);
}

export async function getFile(db: D1Database, id: number | string): Promise<RushFile | null> {
  return await db.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
}

export async function getFolder(db: D1Database, id: number | string): Promise<Folder | null> {
  return await db.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first();
}

export async function createFile(db: D1Database, data: Partial<RushFile>): Promise<RushFile> {
  return (await db.prepare('INSERT INTO files (owner_id, name, size, mime_type, folder_id, r2_key) VALUES (?, ?, ?, ?, ?, ?) RETURNING *')
    .bind(data.owner_id, data.name, data.size, data.mime_type, data.folder_id ?? null, data.r2_key)
    .first()) as RushFile;
}

export async function createFolder(db: D1Database, data: Partial<Folder>): Promise<Folder> {
  return (await db.prepare('INSERT INTO folders (owner_id, name, parent_id) VALUES (?, ?, ?) RETURNING *')
    .bind(data.owner_id, data.name, data.parent_id ?? null)
    .first()) as Folder;
}

export async function deleteFile(db: D1Database, id: number | string, _ownerId?: number): Promise<boolean> {
  const result = await db.prepare('UPDATE files SET status = ? WHERE id = ?').bind('trashed', id).run();
  return result.meta.changes > 0;
}

export async function deleteFolder(db: D1Database, id: number | string): Promise<boolean> {
  const result = await db.prepare('DELETE FROM folders WHERE id = ?').bind(id).run();
  return result.meta.changes > 0;
}

export async function moveFile(db: D1Database, id: number, newFolderId: number): Promise<boolean> {
  const result = await db.prepare('UPDATE files SET folder_id = ? WHERE id = ?').bind(newFolderId, id).run();
  return result.meta.changes > 0;
}

export async function getUploadSession(db: D1Database, id: string): Promise<UploadSession | null> {
  return await db.prepare('SELECT * FROM upload_sessions WHERE id = ?').bind(id).first();
}

export async function updateUploadSession(db: D1Database, id: string, data: Partial<UploadSession>): Promise<boolean> {
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return false;
  const sets = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  const result = await db.prepare(`UPDATE upload_sessions SET ${sets} WHERE id = ?`)
    .bind(...values, id)
    .run();
  return result.meta.changes > 0;
}
