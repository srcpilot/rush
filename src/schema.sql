-- Rush D1 Schema

-- Enums
-- FileStatus (active|trashed|deleted)
-- ShareAccess (public|password|team)

-- RushUser table
CREATE TABLE RushUser (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    storage_used INTEGER DEFAULT 0,
    storage_limit INTEGER DEFAULT 5368709120,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

-- Folder table
CREATE TABLE Folder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES Folder(id),
    owner_email TEXT NOT NULL REFERENCES RushUser(email),
    path TEXT,
    depth INTEGER DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
CREATE INDEX idx_folder_owner_parent ON Folder(owner_email, parent_id);

-- RushFile table
CREATE TABLE RushFile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    folder_id INTEGER REFERENCES Folder(id),
    owner_email TEXT NOT NULL REFERENCES RushUser(email),
    r2_key TEXT NOT NULL,
    size INTEGER,
    mime_type TEXT,
    status TEXT CHECK(status IN ('active', 'trashed', 'deleted')) DEFAULT 'active',
    sha256 TEXT,
    thumbnail_key TEXT,
    versions INTEGER DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
CREATE INDEX idx_file_owner_folder ON RushFile(owner_email, folder_id);
CREATE INDEX idx_file_status ON RushFile(status);

-- Share table
CREATE TABLE Share (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_id INTEGER REFERENCES RushFile(id),
    folder_id INTEGER REFERENCES Folder(id),
    token TEXT NOT NULL UNIQUE,
    access TEXT CHECK(access IN ('public', 'password', 'team')) DEFAULT 'public',
    password_hash TEXT,
    expires_at DATETIME,
    downloads INTEGER DEFAULT 0,
    max_downloads INTEGER,
    created_by_email TEXT NOT NULL REFERENCES RushUser(email),
    created_at DATETIME NOT NULL
);

-- UploadSession table
CREATE TABLE UploadSession (
    id TEXT PRIMARY KEY,
    file_key TEXT NOT NULL,
    upload_id TEXT NOT NULL,
    total_parts INTEGER,
    completed_parts INTEGER DEFAULT 0,
    total_bytes INTEGER,
    status TEXT CHECK(status IN ('pending', 'uploading', 'completing', 'done', 'failed')),
    owner_email TEXT NOT NULL REFERENCES RushUser(email),
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
