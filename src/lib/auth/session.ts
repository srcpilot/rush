import { AuthUser, SessionPayload } from "./index";

interface Env {
  JWT_SECRET: string;
  SESSION_KV: KVNamespace;
}

export async function createSession(env: Env, user: AuthUser): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    userId: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }));

  const unsignedToken = `${header}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(unsignedToken));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const token = `${unsignedToken}.${signatureBase64}`;

  // Store in KV to track active sessions (token hash as key)
  const tokenHash = await hashToken(token);
  await env.SESSION_KV.put(`session:${tokenHash}`, user.id.toString(), { expirationTtl: 60 * 60 * 24 * 7 });

  return token;
}

export async function verifySession(env: Env, token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const unsignedToken = `${headerB64}.${payloadB64}`;
    
    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(env.JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode signature from base64url
    const sigBinary = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify("HMAC", key, sigBinary, encoder.encode(unsignedToken));

    if (!isValid) return null;

    // Check KV (session exists)
    const tokenHash = await hashToken(token);
    const sessionExists = await env.SESSION_KV.get(`session:${tokenHash}`);
    if (!sessionExists) return null;

    const payload: SessionPayload = JSON.parse(atob(payloadB64));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch (e) {
    return null;
  }
}

export async function revokeSession(env: Env, token: string): Promise<void> {
  const tokenHash = await hashToken(token);
  await env.SESSION_KV.delete(`session:${tokenHash}`);
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}
