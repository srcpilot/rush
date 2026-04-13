import type { RushUser } from './types';
import { getUserByEmail, getUser } from './db';

/**
 * WebCrypto PBKDF2 implementation for password hashing.
 * Format: salt:hash (both base64url encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  return `${base64UrlEncode(salt)}:${base64UrlEncode(new Uint8Array(hash))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltStr, hashStr] = storedHash.split(':');
  if (!saltStr || !hashStr) return false;

  const salt = base64UrlDecode(saltStr);
  const originalHash = base64UrlDecode(hashStr);

  const key = await deriveKey(password, salt);
  const newHashBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );

  const newHash = new Uint8Array(newHashBits);
  
  // Constant time comparison
  if (newHash.length !== originalHash.length) return false;
  let result = 0;
  for (let i = 0; i < newHash.length; i++) {
    result |= newHash[i] ^ originalHash[i];
  }
  return result === 0;
}

/**
 * Creates a compact JWT-like token: base64url(header).base64url(payload).base64url(signature)
 */
export async function createToken(
  user: { id: number; email: string },
  secret: string,
  expiresInHours: number = 24
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    userId: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + expiresInHours * 3600,
  };

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signature = await signHmac(unsignedToken, secret);
  const encodedSignature = base64UrlEncode(signature);

  return `${unsignedToken}.${encodedSignature}`;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<{ userId: number; email: string } | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Verify signature
  const signature = base64UrlDecode(encodedSignature);
  const expectedSignature = await signHmac(unsignedToken, secret);

  // Constant time comparison for signature
  if (signature.length !== expectedSignature.length) return null;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature[i] ^ expectedSignature[i];
  }
  if (result !== 0) return null;

  // Parse payload
  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson);

    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Extracts Bearer token from request and fetches user
 */
export async function getAuthUser(request: Request, env: Env): Promise<RushUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token, env.AUTH_SECRET);
  if (!payload) return null;

  return await getUser(payload.userId);
}

// --- Internal Helpers ---

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign', 'verify']
  );
}

async function signHmac(data: string, secret: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return new Uint8Array(signature);
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
