import type { D1Database } from '@cloudflare/workers-types';
import type { RushUser, RushFile, Folder, Share, UploadSession } from './types';

export async function getUser(db: D1Database, id: number): Promise<RushUser | null> {
  return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<RushUser>();
}

export async function getUserByEmail(db: D1Database, email: string): Promise<RushUser | null> {
  return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<RushUser>();
}

export async function createUser(db: D1Database, data: { email: string, name: string, password_hash: string }): Promise<RushUser> {
  return db.prepare(
    'INSERT INTO users (email, name, password_hash, storage_used, storage_quota, created_at, updated_at) VALUES (?, ?, ?, 0, 1073741824, ?, ?) RETURNING *'
  )
    .bind(data.email, data.name, data.password_hash, new Date().toISOString(), new Date().toISOString())
    .first<RushUser>();
}

export async function listFiles(db: D1Database, ownerId: number, folderId?: number): Promise<RushFile[]> {
  if (folderId !== undefined) {
    const res = await db.prepare('SELECT * FROM files WHERE owner_id = ? AND folder_id = ?').bind(ownerId, folderId).all<RushFile>();
    return res.results;
  }
  const res = await db.prepare('SELECT * FROM files WHERE owner_id = ?').bind(ownerId).all<RushFile>();
  return res.results;
}

export async function listFolders(db: D1Database, ownerId: number, parentId?: number): Promise<Folder[]> {
  if (parentId !== undefined) {
    const res = await db.prepare('SELECT * FROM folders WHERE owner_id = ? AND parent_id = ?').bind(ownerId, parentId).all<Folder>();
    return res.results;
  }
  const res = await db.prepare('SELECT * FROM folders WHERE owner_id = ? AND parent_id IS NULL').bind(ownerId).all<Folder>();
  return res.results;
}

export async function searchFiles(db: D1Database, ownerId: number, query: string, limit?: number): Promise<RushFile[]> {
  const res = await db.prepare(
    'SELECT f.* FROM files f JOIN files_fts fts ON f.id = fts.rowid WHERE fts.name MATCH ? AND f.owner_id = ? LIMIT ?'
  )
    .bind(query, ownerId, limit ?? 20)
    .all<RushFile>();
  return res.results;
}

export async function getFile(db: D1Database, id: number): Promise<RushFile | null> {
  return db.prepare('SELECT * FROM files WHERE id = ?').bind(id).first<RushFile>();
}

export async function getFolder(db: D1Database, id: number): Promise<Folder | null> {
  return db.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first<Folder>();
}

export async function createFile(db: D1Database, data: { name: string, folder_id?: number, owner_id: number, r2_key: string, size: number, mime_type: string }): Promise<RushFile> {
  return db.prepare(
    'INSERT INTO files (name, folder_id, owner_id, r2_key, size, mime_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, \'active\', ?, ?) RETURNING *'
  )
    .bind(data.name, data.folder_id, data.owner_id, data.r2_key, data.size, data.mime_type, new Date().toISOString(), new Date().toISOString())
    .first<RushFile>();
}

export async function createFolder(db: D1Database, data: { name: string, parent_id?: number, owner_id: number, path: string, depth: number }): Promise<Folder> {
  return db.prepare(
    'INSERT INTO folders (name, parent_id, owner_id, path, depth, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *'
  )
    .bind(data.name, data.parent_id, data.owner_id, data.path, data.depth, new Date().toISOString(), new Date().toISOString())
    .first<Folder>();
}

export async function deleteFile(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
}

export async function deleteFolder(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM folders WHERE id = ?').bind(id).run();
}

export async function getUploadSession(db: D1Database, id: number): Promise<UploadSession | null> {
  return db.prepare('SELECT * FROM upload_sessions WHERE id = ?').bind(id).first<UploadSession>();
}

export async function createUploadSession(db: D1Database, data: { file_name: string, file_key: string, upload_id: string, total_parts: number, total_bytes: number, folder_id?: number, owner_id: number }): Promise<UploadSession> {
  return db.prepare(
    'INSERT INTO upload_sessions (file_name, file_key, upload_id, total_parts, total_bytes, folder_id, owner_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, \'pending\', ?) RETURNING *'
  )
    .bind(data.file_name, data.file_key, data.upload_id, data.total_parts, data.total_bytes, data.folder_id, data.owner_id, new Date().toISOString())
    .first<UploadSession>();
}

export async function updateUploadSession(db: D1Database, id: number, data: Partial<UploadSession>): Promise<void> {
  const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at');
  if (keys.length === 0) return;

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (data as any)[k]);
  values.push(id);

  await db.prepare(`UPDATE upload_sessions SET ${setClause} WHERE id = ?`).bind(...values).run();
}
