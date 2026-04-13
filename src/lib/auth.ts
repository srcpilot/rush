import type { RushUser } from './types.js';
import { getUserByEmail, getUser } from './db.js';

/**
 * WebCrypto-based authentication utilities.
 * Uses PBKDF2 for password hashing and HMAC-SHA256 for token signing.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTE_LENGTH = 16;
const HASH_ALGO = 'SHA-256';

/**
 * Hashes a password using PBKDF2 with a random salt.
 * Returns a string in the format: salt:hash (both base64url encoded).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const hash = await deriveKey(password, salt);
  
  const saltBase64 = base64UrlEncode(salt);
  const hashBase64 = base64UrlEncode(new Uint8Array(hash));
  
  return `${saltBase64}:${hashBase64}`;
}

/**
 * Verifies a password against a stored hash.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltBase64, originalHashBase64] = storedHash.split(':');
  if (!saltBase64 || !originalHashBase64) return false;

  const salt = base64UrlDecode(saltBase64);
  const originalHash = base64UrlDecode(originalHashBase64);
  
  const derivedHash = await deriveKey(password, salt);
  
  // Constant-time comparison
  if (derivedHash.length !== originalHash.length) return false;
  let result = 0;
  for (let i = 0; i < derivedHash.length; i++) {
    result |= derivedHash[i] ^ originalHash[i];
  }
  return result === 0;
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
    exp: now + expiresInHours * 60 * 60,
  };

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHmac(unsignedToken, secret);
  const encodedSignature = base64UrlEncode(signature);

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

  // Verify signature
  let match = true;
  if (signature.length !== expectedSignature.length) {
    match = false;
  } else {
    for (let i = 0; i < signature.length; i++) {
      if (signature[i] !== expectedSignature[i]) {
        match = false;
        break;
      }
    }
  }

  if (!match) return null;

  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
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
 * Extracts user from Request via Bearer token.
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
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: HASH_ALGO,
    },
    keyMaterial,
    256
  );

  return new Uint8Array(derivedBits);
}

async function signHmac(data: string, secret: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: HASH_ALGO },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    keyMaterial,
    encoder.encode(data)
  );

  return new Uint8Array(signature);
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
