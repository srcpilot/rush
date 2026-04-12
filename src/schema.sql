-- Rush D1 Schema
-- Generated for task-02-schema

-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL CHECK (length(name) >= 2 AND length(name) <= 100),
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    storage_used INTEGER DEFAULT 0,
    storage_limit INTEGER DEFAULT 5368709120,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Folders Table
CREATE TABLE folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 255),
    parent_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path TEXT,
    depth INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_folders_owner_parent ON folders(owner_id, parent_id);

-- Files Table
CREATE TABLE files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 255),
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    r2_key TEXT NOT NULL,
    size INTEGER,
    mime_type TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trashed', 'deleted')),
    sha256 TEXT,
    thumbnail_key TEXT,
    versions INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_files_owner_folder ON files(owner_id, folder_id);
CREATE INDEX idx_files_status ON files(status);

-- Shares Table
CREATE TABLE shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    access TEXT NOT NULL DEFAULT 'public' CHECK (access IN ('public', 'password')),
    password_hash TEXT,
    expires_at DATETIME,
    downloads INTEGER DEFAULT 0,
    max_downloads INTEGER,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Upload Sessions Table
CREATE TABLE upload_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT,
    file_key TEXT NOT NULL,
    upload_id TEXT NOT NULL,
    total_parts INTEGER,
    completed_parts INTEGER DEFAULT 0,
    total_bytes INTEGER,
    folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completing', 'done', 'failed')),
    owner_id INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- FTS5 Virtual Table for Files Search
CREATE VIRTUAL TABLE files_fts USING fts5(
    name,
    content='files',
    content_rowid='id'
);

-- Triggers to sync files_fts with files table
CREATE TRIGGER files_ai AFTER INSERT ON files BEGIN
  INSERT INTO files_fts(rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER files_ad AFTER DELETE ON files BEGIN
  INSERT INTO files_fts(files_fts, rowid, name) VALUES('delete', old.id, old.name);
END;

CREATE TRIGGER files_au AFTER UPDATE ON files BEGIN
  INSERT INTO files_fts(files_fts, rowid, name) VALUES('delete', old.id, old.name);
  INSERT INTO files_fts(rowid, name) VALUES (new.id, new.name);
END;
