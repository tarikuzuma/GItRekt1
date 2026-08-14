import prisma from "@/lib/prisma";
import { deserializeUser } from "@/lib/json-list";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  try {
    // If no email provided, just return all users (fallback for MVP)
    if (!email) {
      const allUsers = await prisma.user.findMany({ take: 20 });
      return NextResponse.json(allUsers.map(deserializeUser));
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { swipes: true }
    });

    if (!currentUser) {
      const allUsers = await prisma.user.findMany({ take: 20 });
      return NextResponse.json(allUsers.map(deserializeUser));
    }

    // Get IDs of users already swiped on.
    // The element type is annotated explicitly: the type Prisma infers through
    // `include` doesn't always survive Next's build-time typecheck, which then
    // reports `s` as an implicit any.
    const swipedUserIds = currentUser.swipes
      .map((s: { targetUserId: string | null }) => s.targetUserId)
      .filter((id): id is string => Boolean(id));

    // Fetch users not in the swiped list and not the current user
    const swipableUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          { id: { notIn: swipedUserIds } }
        ]
      },
      take: 20
    });

    return NextResponse.json(swipableUsers.map(deserializeUser));
  } catch (error) {
    console.error('Fetch swipable users error:', error);
    return NextResponse.json({ error: 'Failed to fetch swipable users' }, { status: 500 });
  }
}
