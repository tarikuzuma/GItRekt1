import prisma from "@/lib/prisma";
import { Swipe } from "@prisma/client";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  try {
    // If no email provided, just return all users (fallback for MVP)
    if (!email) {
      const allUsers = await prisma.user.findMany({
        take: 20
      });
      return NextResponse.json(allUsers);
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { swipes: true }
    });

    if (!currentUser) {
      const allUsers = await prisma.user.findMany({
        take: 20
      });
      return NextResponse.json(allUsers);
    }

    // Get IDs of users already swiped on
    const swipedUserIds = currentUser.swipes
      .filter((s: Swipe) => s.targetUserId)
      .map((s: Swipe) => s.targetUserId as string);

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

    return NextResponse.json(swipableUsers);
  } catch (error) {
    console.error('Fetch swipable users error:', error);
    return NextResponse.json({ error: 'Failed to fetch swipable users' }, { status: 500 });
  }
}
