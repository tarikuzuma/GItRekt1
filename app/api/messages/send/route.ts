import prisma from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { chatId, content, senderId } = await request.json();

    if (!chatId || !content || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Persist to database
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        content,
        senderId,
      },
      include: {
        sender: true
      }
    });

    // 2. Broadcast via Supabase Realtime
    await supabase.channel(`chat:${chatId}`).send({
      type: 'broadcast',
      event: 'new-message',
      payload: message
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
