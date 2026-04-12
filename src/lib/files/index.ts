import { FileMetadata } from "./types";

export type FileStatus = "active" | "trashed";

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  r2Key: string;
  folderId: string | null;
  userId: string;
  status: FileStatus;
  createdAt: Date;
  updatedAt: Date;
  thumbnailUrl?: string;
}

export interface Folder {
  id: string;
  name: string;
  fileCount: number;
  createdAt: Date;
}

export interface FileListResponse {
  files: Array<Omit<FileMetadata, "r2Key" | "userId" | "status">>;
  folders: Folder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
