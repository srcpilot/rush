import { AuthUser } from "./index";

export async function withAuth(request: Request, env: any, next: (req: Request, user: AuthUser) => Promise<Response>): Promise<Response> {
  let token: string | null = null;

  // 1. Check Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Check cookie if no header
  if (!token) {
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
      token = cookies["rush_session"] || null;
    }
  }

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Verify token via session module (imported via dynamic import or assumed available in global scope context for this task)
  // In a real project, we'd import { verifySession } from "./session";
  // For the sake of this generated code, we assume it's accessible.
  const { verifySession } = await import("./session");
  const payload = await verifySession(env, token);

  if (!payload) {
    return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Fetch user from D1 (assumed available in env)
  const user = await env.DB.prepare("SELECT id, email, name FROM users WHERE id = ?")
    .bind(payload.userId)
    .first<AuthUser>();

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Create new request with user data attached via custom header for downstream (since Request is immutable)
  // Or more common in Workers: pass user via a context object in a framework, 
  // but here we'll just pass it to the next handler function.
  return next(request, user);
}
