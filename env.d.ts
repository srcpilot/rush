/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
  AUTH_SECRET: string;
}

interface CookieStore {
  get(name: string): { name: string; value: string } | undefined;
  getAll(): Array<{ name: string; value: string }>;
  set(name: string, value: string): void;
  delete(name: string): void;
}

declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: CookieStore;
  }
  export class NextResponse extends Response {
    static json(data: unknown, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
    cookies: CookieStore;
  }
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    refresh: () => void;
    back: () => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): {
    get(key: string): string | null;
    toString(): string;
  };
  export function useParams(): Record<string, string | string[]>;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/link' {
  import type { JSX } from 'react';
  interface LinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    download?: boolean | string;
    [key: string]: unknown;
  }
  export default function Link(props: LinkProps): JSX.Element;
}

declare module 'next/image' {
  import type { JSX } from 'react';
  interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    [key: string]: unknown;
  }
  export default function Image(props: ImageProps): JSX.Element;
}

declare module 'next/dynamic' {
  import type { ComponentType } from 'react';
  export default function dynamic(
    loader: () => Promise<{ default: ComponentType<unknown> }>,
    opts?: { ssr?: boolean; loading?: ComponentType }
  ): ComponentType<unknown>;
}

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string | string[];
    openGraph?: Record<string, unknown>;
  }
}

declare module 'next/font/google' {
  export function Inter(opts: { subsets: string[] }): { className: string };
}

// HTMLInputElement from workers-types is missing browser properties.
// Augment it so client components can read .value, .files, .click().
interface HTMLInputElement {
  value: string;
  files: FileList | null;
  click(): void;
}

interface FileList {
  readonly length: number;
  item(index: number): File | null;
  [Symbol.iterator](): IterableIterator<File>;
}

interface DataTransfer {
  files: FileList;
}

// Browser globals used in 'use client' components.
// Workers-types does not include these since Workers don't have a DOM,
// but client components run in a browser where these exist.
declare const localStorage: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
};

declare const location: {
  origin: string;
  href: string;
  pathname: string;
  search: string;
  hash: string;
};

declare module 'cloudflare:workers' {
  export function getCloudflareContext(): {
    env: Env;
    ctx: ExecutionContext;
  };
}
