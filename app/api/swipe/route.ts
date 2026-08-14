import prisma from "@/lib/prisma";
import { ensureConversation } from "@/lib/conversation";
import { supabase } from "@/lib/supabase";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { actorEmail, targetUserId, direction, targetType } = await request.json();

    if (!actorEmail || !targetUserId || !direction || !targetType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const actor = await prisma.user.findUnique({
      where: { email: actorEmail.toLowerCase() }
    });

    if (!actor) {
      return NextResponse.json({ error: 'Actor not found' }, { status: 404 });
    }

    // 1. Create the swipe
    const swipe = await prisma.swipe.upsert({
      where: {
        actorId_targetUserId_targetTeamId: {
          actorId: actor.id,
          targetUserId: targetType === 'USER' ? targetUserId : null,
          targetTeamId: targetType === 'TEAM' ? targetUserId : null,
        }
      },
      update: { direction },
      create: {
        actorId: actor.id,
        targetUserId: targetType === 'USER' ? targetUserId : null,
        targetTeamId: targetType === 'TEAM' ? targetUserId : null,
        targetType,
        direction,
      }
    });

    // 2. Check for match if direction is LIKE
    let isMatch = false;
    let chatId: string | null = null;
    let matchedUser = null;

    if (direction === 'LIKE' && targetType === 'USER') {
      const reciprocalSwipe = await prisma.swipe.findFirst({
        where: {
          actorId: targetUserId,
          targetUserId: actor.id,
          direction: 'LIKE'
        }
      });

      if (reciprocalSwipe) {
        isMatch = true;

        // Create (or reuse) the chatroom for this pair.
        chatId = await ensureConversation(actor.id, targetUserId);

        matchedUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, name: true, image: true, role: true, university: true }
        });

        // Notify via Supabase Realtime (no-op until Supabase creds are set)
        await supabase.channel('matches').send({
          type: 'broadcast',
          event: 'new-match',
          payload: {
            users: [actor.id, targetUserId],
            names: [actor.name, matchedUser?.name ?? 'Someone'],
            chatId,
          }
        });
      }
    }

    return NextResponse.json({ success: true, isMatch, chatId, matchedUser });
  } catch (error) {
    console.error('Swipe error:', error);
    return NextResponse.json({ error: 'Failed to process swipe' }, { status: 500 });
  }
}
