import { NextResponse } from 'next/server';

import { listConversations } from '@/lib/conversation';

/** GET /api/conversations?email= — chatrooms this user was matched into. */
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    return NextResponse.json(await listConversations(email));
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
