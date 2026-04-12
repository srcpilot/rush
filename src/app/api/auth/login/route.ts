import { LoginInput } from "../../../lib/auth/index";
import { verifyCorrected } from "../../../lib/auth/password";
import { createSession } from "../../../lib/auth/session";

export async function handleLogin(request: Request, env: any): Promise<Response> {
  try {
    const body: LoginInput = await request.json();

    const user = await env.DB.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?")
      .bind(body.email)
      .first<{ id: number, email: string, name: string, password_hash: string }>();

    if (!user || !(await verifyCorrected(body.password, user.password_hash))) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401 });
    }

    const token = await createSession(env, { id: user.id, email: user.email, name: user.name });

    return new Response(JSON.stringify({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      token 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `rush_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/`
      }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
