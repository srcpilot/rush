import type { D1Database } from '@cloudflare/workers-types';
import type { RushUser, RushFile, Folder } from './types.js';

export async function getUser(db: D1Database, id: number): Promise<RushUser | null> {
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
}

export async function getUserByEmail(db: D1Database, email: string): Promise<RushUser | null> {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function createUser(db: D1Database, data: { email: string; name: string; password_hash: string }): Promise<RushUser> {
  return await db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING *')
    .bind(data.email, data.name, data.password_hash)
    .first();
}

export async function listFiles(db: D1Database, ownerId: number, folderId?: number): Promise<RushFile[]> {
  if (folderId) {
    return await db.prepare('SELECT * FROM files WHERE owner_id = ? AND folder_id = ?')
      .bind(ownerId, folderId)
      .all()
      .then(res => res.results as RushFile[]);
  }
  return await db.prepare('SELECT * FROM files WHERE owner_id = ?')
    .bind(ownerId)
    .all()
    .then(res => res.results as RushFile[]);
}

export async function listFolders(db: D1Database, ownerId: number, parentId?: number): Promise<Folder[]> {
  if (parentId) {
    return await db.prepare('SELECT * FROM folders WHERE owner_id = ? AND parent_id = ?')
      .bind(ownerId, parentId)
      .all()
      .then(res => res.results as Folder[]);
  }
  return await db.prepare('SELECT * FROM folders WHERE owner_id = ? AND parent_id IS NULL')
    .bind(ownerId)
    .all()
    .then(res => res.results as Folder[]);
}

export async function searchFiles(db: D1Database, ownerId: number, query: string): Promise<RushFile[]> {
  return await db.prepare('SELECT * FROM files WHERE owner_id = ? AND name MATCH ?')
    .bind(ownerId, query)
    .all()
    .then(res => res.results as RushFile[]);
}

export async function getFile(db: D1Database, id: number): Promise<RushFile | null> {
  return await db.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
}

export async function getFolder(db: D1Database, id: number): Promise<Folder | null> {
  return await db.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first();
}

export async function createFile(db: D1Database, data: Partial<RushFile>): Promise<RushFile> {
  return await db.prepare('INSERT INTO files (owner_id, name, size, mime_type, folder_id, r2_key) VALUES (?, ?, ?, ?, ?, ?) RETURNING *')
    .bind(data.owner_id, data.name, data.size, data.mime_type, data.folder_id, data.r2_key)
    .first();
}

export async function createFolder(db: D1Database, data: Partial<Folder>): Promise<Folder> {
  return await db.prepare('INSERT INTO folders (owner_id, name, parent_id) VALUES (?, ?, ?) RETURNING *')
    .bind(data.owner_id, data.name, data.parent_id)
    .first();
}

export async function deleteFile(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
  return result.meta.changes > 0;
}

export async function moveFile(db: D1Database, id: number, newFolderId: number): Promise<boolean> {
  const result = await db.prepare('UPDATE files SET folder_id = ? WHERE id = ?').bind(newFolderId, id).run();
  return result.meta.changes > 0;
}
