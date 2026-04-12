import { NextResponse } from 'next/server';

// Mock user for demonstration
const MOCK_USER = {
  id: 'user_123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
};

export async function GET() {
  return NextResponse.json(MOCK_USER);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { name, avatarUrl } = body;

    // In a real app, you'd update D1 here:
    // await db.prepare('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?')
    //   .bind(name, avatarUrl, MOCK_USER.id).run();

    return NextResponse.json({
      name: name || MOCK_USER.name,
      email: MOCK_USER.email,
      avatarUrl: avatarUrl || MOCK_USER.avatarUrl
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update account' }, { status: 400 });
  }
}
