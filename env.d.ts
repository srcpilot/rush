/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
}

declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: ReadonlyRequestCookies;
  }

  export class NextResponse extends Response {
    static json(data: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(): NextResponse;
    cookies: ResponseCookies;
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
  export function useSearchParams(): ReadonlyURLSearchParams;
  export function useParams(): Record<string, string | string[]>;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/link' {
  const Link: React.ComponentType<{ href: string; [k: string]: any }>;
  export default Link;
}

declare module 'next/image' {
  const Image: React.ComponentType<{ src: string; alt: string; [k: string]: any }>;
  export default Image;
}

declare module 'next/dynamic' {
  const dynamic: (loader: () => Promise<any>, opts?: any) => React.ComponentType<any>;
  export default dynamic;
}

declare module 'cloudflare:workers' {
  export function getCloudflareContext(): {
    env: Env;
    ctx: ExecutionContext;
  };
}

interface HTMLInputElement {
  value: string;
  files: FileList | null;
  type: string;
  click(): void;
}

interface HTMLFormElement {
  submit(): void;
}

interface FileList {
  readonly length: number;
  item(index: number): File | null;
  [index: number]: File;
}

interface DataTransfer {
  readonly files: FileList;
}

declare var localStorage: {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

declare var location: {
  href: string;
  origin: string;
  pathname: string;
  search: string;
  reload(): void;
};

declare var window: {
  addEventListener: Function;
  removeEventListener: Function;
  localStorage: typeof localStorage;
  location: typeof location;
};

declare function setTimeout(handler: Function, timeout?: number): number;
declare function clearTimeout(id: number): void;
