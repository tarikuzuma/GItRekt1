import prisma from '@/lib/prisma';

/**
 * 1-on-1 chatrooms created on a mutual match.
 *
 * The chat ID is derived from the two user IDs rather than stored randomly, so
 * both sides independently compute the same room and ChatMessage rows line up
 * no matter who opens the chat first.
 */

/** Deterministic room ID for a pair of users. Order-independent. */
export function buildChatId(userIdA: string, userIdB: string): string {
  const [a, b] = [userIdA, userIdB].sort();
  return `dm-${a}__${b}`;
}

/** The two user IDs a chatId was built from, or null if it isn't a DM room. */
export function parseChatId(chatId: string): [string, string] | null {
  if (!chatId.startsWith('dm-')) return null;
  const parts = chatId.slice(3).split('__');
  return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null;
}

export interface ConversationSummary {
  chatId: string;
  createdAt: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
    role: string | null;
    university: string | null;
  };
}

/**
 * Create the chatroom for a match, or return the existing one.
 *
 * Idempotent — swiping right again, or the other person matching back, reuses
 * the same room rather than creating a duplicate.
 */
export async function ensureConversation(userIdA: string, userIdB: string): Promise<string> {
  if (userIdA === userIdB) {
    throw new Error('Cannot create a conversation with yourself.');
  }

  const [a, b] = [userIdA, userIdB].sort();
  const chatId = buildChatId(a, b);

  await prisma.conversation.upsert({
    where: { chatId },
    update: {},
    create: { chatId, userAId: a, userBId: b },
  });

  return chatId;
}

/** Every chatroom a user is part of, newest first. */
export async function listConversations(email: string): Promise<ConversationSummary[]> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  if (!user) return [];

  const rows = await prisma.conversation.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    orderBy: { createdAt: 'desc' },
    include: {
      userA: { select: { id: true, name: true, image: true, role: true, university: true } },
      userB: { select: { id: true, name: true, image: true, role: true, university: true } },
    },
  });

  return rows.map((row) => ({
    chatId: row.chatId,
    createdAt: row.createdAt.toISOString(),
    otherUser: row.userAId === user.id ? row.userB : row.userA,
  }));
}
