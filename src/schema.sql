CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  storage_used INTEGER NOT NULL DEFAULT 0,
  storage_quota INTEGER NOT NULL DEFAULT 5368709120,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE folders (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER,
  owner_id INTEGER NOT NULL,
  path TEXT NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
);

CREATE INDEX idx_folders_owner_parent ON folders(owner_id, parent_id);

CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  folder_id INTEGER,
  owner_id INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','trashed','deleted')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

CREATE INDEX idx_files_owner_folder ON files(owner_id, folder_id);

CREATE TABLE shares (
  id INTEGER PRIMARY KEY,
  file_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  access TEXT NOT NULL DEFAULT 'public' CHECK(access IN ('public','password')),
  password_hash TEXT,
  expires_at TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
);

CREATE TABLE upload_sessions (
  id INTEGER PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  parts_completed INTEGER NOT NULL DEFAULT 0,
  total_parts INTEGER,
  total_bytes INTEGER,
  folder_id INTEGER,
  owner_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','complete','aborted')),
  created_at TEXT NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE files_fts USING fts5(name, content='files', content_rowid='id');

CREATE TRIGGER files_fts_insert AFTER INSERT ON files BEGIN
  INSERT INTO files_fts(rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER files_fts_update AFTER UPDATE ON files BEGIN
  DELETE FROM files_fts WHERE rowid = old.id;
  INSERT INTO files_fts(rowid, name) VALUES (new.id, new.name);
END;

CREATE TRIGGER files_fts_delete AFTER DELETE ON files BEGIN
  DELETE FROM files_fts WHERE rowid = old.id;
END;
