/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  SESSIONS: KVNamespace;
  JWT_SECRET: string;
}

// Vinext shims — Next.js modules re-implemented for Cloudflare Workers/Vite
declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL;
  }
  export class NextResponse extends Response {
    static json(body: unknown, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
  export type NextMiddleware = (
    request: NextRequest,
    event: unknown
  ) => Response | NextResponse | undefined | null | void;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams & {
    get(key: string): string | null;
    toString(): string;
  };
  export function useParams<T extends Record<string, string | string[]> = Record<string, string | string[]>>(): T;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/link' {
  import type { AnchorHTMLAttributes } from 'react';
  export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    replace?: boolean;
    scroll?: boolean;
    prefetch?: boolean;
    children?: React.ReactNode;
  }
  export default function Link(props: LinkProps): JSX.Element;
}

declare module 'next/image' {
  import type { ImgHTMLAttributes } from 'react';
  export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
  }
  export default function Image(props: ImageProps): JSX.Element;
}

declare module 'next/dynamic' {
  import type { ComponentType } from 'react';
  interface DynamicOptions<P = Record<string, unknown>> {
    loading?: () => JSX.Element | null;
    ssr?: boolean;
  }
  export default function dynamic<P = Record<string, unknown>>(
    loader: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
    options?: DynamicOptions<P>
  ): ComponentType<P>;
}

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    keywords?: string | string[];
    authors?: { name?: string; url?: string }[];
    openGraph?: Record<string, unknown>;
    twitter?: Record<string, unknown>;
    icons?: string | { rel?: string; url: string }[];
    viewport?: string;
    themeColor?: string;
    robots?: string;
    [key: string]: unknown;
  }
  export type NextPage<P = Record<string, unknown>> = import('react').ComponentType<P>;
}

declare module 'next/font/google' {
  interface FontOptions {
    subsets?: string[];
    weight?: string | string[];
    style?: string | string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    variable?: string;
    preload?: boolean;
  }
  interface FontResult {
    className: string;
    style: { fontFamily: string; fontStyle?: string };
    variable: string;
  }
  export function Inter(options?: FontOptions): FontResult;
  export function Roboto(options?: FontOptions): FontResult;
  export function Open_Sans(options?: FontOptions): FontResult;
  export function Geist(options?: FontOptions): FontResult;
  export function Geist_Mono(options?: FontOptions): FontResult;
}

declare module 'cloudflare:workers' {
  export type { WorkerEntrypoint } from '@cloudflare/workers-types';
  export const env: Env;
  export function getCloudflareContext<E extends Env = Env>(): { env: E; ctx: ExecutionContext };
}
