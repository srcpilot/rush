import { withAuth } from "../../../lib/auth/middleware";
import { AuthUser } from "../../../lib/auth/index";

export async function handleMe(request: Request, env: any): Promise<Response> {
  return withAuth(request, env, async (req, user: AuthUser) => {
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}
