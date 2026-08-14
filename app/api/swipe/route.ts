import prisma from "@/lib/prisma";
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
        
        // Notify via Supabase Realtime
        await supabase.channel('matches').send({
          type: 'broadcast',
          event: 'new-match',
          payload: {
            users: [actor.id, targetUserId],
            names: [actor.name, 'Someone'], // We can fetch the target name too
          }
        });
      }
    }

    return NextResponse.json({ success: true, isMatch });
  } catch (error) {
    console.error('Swipe error:', error);
    return NextResponse.json({ error: 'Failed to process swipe' }, { status: 500 });
  }
}
