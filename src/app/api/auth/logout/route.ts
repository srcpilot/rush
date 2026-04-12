import { revokeSession } from "../../../lib/auth/session";

export async function handleLogout(request: Request, env: any): Promise<Response> {
  try {
    const cookieHeader = request.headers.get("Cookie");
    let token: string | null = null;

    if (cookieHeader) {
      const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
      token = cookies["rush_session"] || null;
    }

    if (token) {
      await revokeSession(env, token);
    }

    return new Response(JSON.stringify({ message: "Logged out successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "rush_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
