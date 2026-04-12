export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFolderInput = {
  name: string;
  parentId?: string | null;
};

export type RenameFolderInput = {
  name: string;
};

export type MoveFolderInput = {
  parentId: string | null;
};

export type Breadcrumb = {
  id: string;
  name: string;
};

export interface FolderService {
  list(parentId?: string | null): Promise<Folder[]>;
  create(input: CreateFolderInput): Promise<Folder>;
  rename(id: string, input: RenameFolderInput): Promise<Folder>;
  move(id: string, input: MoveFolderInput): Promise<Folder>;
  delete(id: string): Promise<void>;
  getBreadcrumbs(id: string): Promise<Breadcrumb[]>;
}
