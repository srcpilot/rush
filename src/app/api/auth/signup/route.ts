import { SignupInput } from "../../lib/auth/index";
import { hash } from "../../lib/auth/password";

export async function handleSignup(request: Request, env: any): Promise<Response> {
  try {
    const body: SignupInput = await request.json();
    
    if (!body.email || !body.password || body.password.length < 8) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    const hashedPassword = await hash(body.password);

    const result = await env.DB.prepare(
      "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING id"
    )
      .bind(body.email, body.name, hashedPassword)
      .first<{ id: number }>();

    if (!result) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500 });
    }

    return new Response(JSON.stringify({ id: result.id, email: body.email, message: "Signup successful" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
