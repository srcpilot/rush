import type { RushUser } from './types.js';
import { getUserByEmail, getUser } from './db.js';

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Hashes a password using PBKDF2 with a random salt.
 * Returns a string in the format "salt:hash" (both base64 encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const hash = await deriveKey(password, salt);
  
  const saltBase64 = base64UrlEncodeBytes(salt);
  const hashBase64 = base64UrlEncodeBytes(hash);
  
  return `${saltBase64}:${hashBase64}`;
}

/**
 * Verifies a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltBase64, hashBase64] = storedHash.split(':');
  if (!saltBase64 || !hashBase64) return false;

  const salt = base64UrlDecode(saltBase64);
  const originalHash = base64UrlDecode(hashBase64);
  
  const newHash = await deriveKey(password, salt);
  
  // Constant time comparison
  if (newHash.length !== originalHash.length) return false;
  let diff = 0;
  for (let i = 0; i < newHash.length; i++) {
    diff |= newHash[i] ^ originalHash[i];
  }
  return diff === 0;
}

/**
 * Creates a compact JWT-like token.
 * Format: base64url(header).base64url(payload).base64url(signature)
 */
export async function createToken(
  user: { id: number; email: string },
  secret: string,
  expiresInHours: number = 24
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    userId: user.id,
    email: user.email,
    exp: now + expiresInHours * 3600
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  const signature = await signHmac(unsignedToken, secret);
  const encodedSignature = base64UrlEncodeBytes(signature);

  return `${unsignedToken}.${encodedSignature}`;
}

/**
 * Verifies a token and returns the payload if valid.
 */
export async function verifyToken(token: string, secret: string): Promise<{ userId: number; email: string } | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  const signature = base64UrlDecode(encodedSignature);
  const expectedSignature = await signHmac(unsignedToken, secret);

  // Constant time comparison
  if (signature.length !== expectedSignature.length) return null;
  let diff = 0;
  for (let i = 0; i < signature.length; i++) {
    diff |= signature[i] ^ expectedSignature[i];
  }
  
  if (diff !== 0) return null;

  try {
    const payloadStr = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadStr);
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && now > payload.exp) return null;
    
    return {
      userId: payload.userId,
      email: payload.email
    };
  } catch (e) {
    return null;
  }
}

/**
 * Extracts user from Request using Bearer token.
 */
export async function getAuthUser(request: Request, env: Env): Promise<RushUser | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  const payload = await verifyToken(token, env.AUTH_SECRET);
  
  if (!payload) return null;

  return await getUser(payload.userId);
}

// --- Internal Helpers ---

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return new Uint8Array(derivedBits);
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

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}
