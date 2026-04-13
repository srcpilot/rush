import type { RushUser } from './types.js';

const ITERATIONS = 10000;

async function hash(message: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID();
  const hashStr = await hash(password, salt);
  return `${salt}.${hashStr}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hashStr] = storedHash.split('.');
  const newHash = await hash(password, salt);
  return newHash === hashStr;
}

export function createToken(userId: number, secret: string): string;
export function createToken(env: Env, userId: number): string;
export function createToken(userIdOrEnv: number | Env, secretOrUserId: string | number): string {
  let userId: number;
  let secret: string;
  if (typeof userIdOrEnv === 'object') {
    // createToken(env, userId)
    userId = secretOrUserId as number;
    secret = (userIdOrEnv as Env).JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
  } else {
    // createToken(userId, secret)
    userId = userIdOrEnv as number;
    secret = secretOrUserId as string;
  }
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
  };
  const encoded = btoa(JSON.stringify(payload));
  const signature = btoa(secret + encoded);
  return `${encoded}.${signature}`;
}

export function verifyToken(token: string, secret: string): { userId: number } | null {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature || signature !== btoa(secret + encoded)) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(encoded));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function withAuth(handler: (userId: number, request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.substring(7);
    // In a real implementation, the secret would come from environment variables
    const secret = 'CHANGE_ME_IN_PRODUCTION'; 
    const decoded = verifyToken(token, secret);

    if (!decoded) {
      return new Response('Unauthorized', { status: 401 });
    }

    return handler(decoded.userId, request);
  };
}

export async function getAuthUser(db: any, userId: number): Promise<RushUser | null>;
export async function getAuthUser(request: Request, env: Env): Promise<RushUser | null>;
export async function getAuthUser(dbOrRequest: any, userIdOrEnv: any): Promise<RushUser | null> {
  // Overload 1: called with (request, env) — extract userId from token then look up user
  if (dbOrRequest instanceof Request) {
    const request = dbOrRequest;
    const env: Env = userIdOrEnv;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const secret = env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION';
    const decoded = verifyToken(token, secret);
    if (!decoded) return null;
    return env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(decoded.userId).first();
  }
  // Overload 2: called with (db, userId) — direct lookup
  const db = dbOrRequest;
  const userId: number = userIdOrEnv;
  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
}
