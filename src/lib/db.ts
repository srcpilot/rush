import { D1Database } from '@cloudflare/workers-types';
import type { RushFile } from './rush-file';
import type { Folder } from './folder';

export async function getUser(db: D1Database, email: string): Promise<any> {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function getUserByEmail(db: D1Database, email: string): Promise<any> {
  return await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function createUser(db: D1Database, user: any): Promise<void> {
  await db.prepare('INSERT INTO users (email, name, password_hash, active, joined) VALUES (?, ?, ?, ?, ?)')
    .bind(user.email, user.name, user.password_hash, user.active, user.joined)
    .run();
}

export async function listFiles(db: D1Database, ownerId: number): Promise<RushFile[]> {
  return await db.prepare('SELECT * FROM files WHERE owner_id = ?')
    .bind(ownerId)
    .all()
    .then(res => res.results as RushFile[]);
}

export async function listFolders(db: D1Database, ownerId: number): Promise<Folder[]> {
  return await db.prepare('SELECT * FROM folders WHERE owner_id = ?')
    .bind(ownerId)
    .all()
    .then(res => res.results as Folder[]);
}

export async function searchFiles(db: D1Database, ownerId: number, query: string, limit: number = 20): Promise<{ files: RushFile[], total: number }> {
  const results = await db.prepare(`
    SELECT f.* 
    FROM files_fts fts 
    JOIN files f ON f.id = fts.rowid 
    WHERE fts.name MATCH ? 
    AND f.owner_id = ? 
    AND f.status = 'active' 
    LIMIT ?
  `)
    .bind(query, ownerId, limit)
    .all();

  const files = results.results as RushFile[];
  
  return { files, total: files.length };
}

export async function getFile(db: D1Database, id: number): Promise<RushFile | undefined> {
  return await db.prepare('SELECT * FROM files WHERE id = ?').bind(id).first<RushFile>();
}

export async function getFolder(db: D1Database, id: number): Promise<Folder | undefined> {
  return await db.prepare('SELECT * FROM folders WHERE id = ?').bind(id).first<Folder>();
}

export async function createFile(db: D1Database, file: any): Promise<void> {
  await db.prepare('INSERT INTO files (name, size, type, owner_id, folder_id, status) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(file.name, file.size, file.type, file.owner_id, file.folder_id, file.status)
    .run();
}

export async function createFolder(db: D1Database, folder: any): Promise<void> {
  await db.prepare('INSERT INTO folders (name, owner_id, parent_id) VALUES (?, ?, ?)')
    .bind(folder.name, folder.owner_id, folder.parent_id)
    .run();
}

export async function deleteFile(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
}

export async function moveFile(db: D1Database, id: number, newFolderId: number): Promise<void> {
  await db.prepare('UPDATE files SET folder_id = ? WHERE id = ?').bind(newFolderId, id).run();
}

export async function getUploadSession(db: D1Database, id: string): Promise<any> {
  return await db.prepare('SELECT * FROM upload_sessions WHERE id = ?').bind(id).first();
}

export async function createUploadSession(db: D1Database, session: any): Promise<void> {
  await db.prepare('INSERT INTO upload_sessions (id, file_key, upload_id, file_name, mime_type, total_bytes, completed_parts, folder_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(session.id, session.file_key, session.upload_id, session.file_name, session.mime_type, session.total_bytes, session.completed_parts, session.folder_id, session.user_id)
    .run();
}

export async function updateUploadSession(db: D1Database, id: string, updates: any): Promise<void> {
  const keys = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  await db.prepare(`UPDATE upload_sessions SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

export async function createShare(db: D1Database, share: any): Promise<void> {
  await db.prepare('INSERT INTO shares (id, token, file_id, folder_id, access, password_hash, expires_at, max_downloads, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(share.id, share.token, share.file_id, share.folder_id, share.access, share.password_hash, share.expires_at, share.max_downloads, share.downloads, share.created_at)
    .run();
}

export async function getShareByToken(db: D1Database, token: string): Promise<any> {
  return await db.prepare('SELECT * FROM shares WHERE token = ?').bind(token).first();
}

export async function incrementShareDownload(db: D1Database, id: string): Promise<void> {
  await db.prepare('UPDATE shares SET downloads = downloads + 1 WHERE id = ?').bind(id).run();
}
