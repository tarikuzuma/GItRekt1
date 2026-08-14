/**
 * Persistence for resume metadata + generated tags, via Prisma.
 *
 * Local dev runs on SQLite (prisma/dev.db), so `tags` is stored as a JSON
 * string. Schema lives in prisma/schema.prisma (model Resume).
 */

import prisma from '@/lib/prisma';
import type { ResumeTag } from '@/lib/resume-tags';
import type { TagSource } from '@/lib/gemini';

export interface ResumeRecord {
  email: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  pageCount: number | null;
  tags: ResumeTag[];
  tagSource: TagSource;
  updatedAt: string;
}

function parseTags(raw: unknown): ResumeTag[] {
  if (Array.isArray(raw)) return raw as ResumeTag[];
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ResumeTag[]) : [];
  } catch {
    return [];
  }
}

function toRecord(row: {
  email: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  pageCount: number | null;
  tags: string;
  tagSource: string;
  updatedAt: Date;
}): ResumeRecord {
  return {
    email: row.email,
    fileKey: row.fileKey,
    fileName: row.fileName,
    fileSize: row.fileSize,
    contentType: row.contentType,
    pageCount: row.pageCount,
    tags: parseTags(row.tags),
    tagSource: (row.tagSource as TagSource) ?? 'heuristic',
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Upsert a user's resume record. Returns null on failure rather than throwing —
 * a dead database shouldn't lose the tags we just extracted, since the client
 * also caches them locally.
 */
export async function saveResumeRecord(
  record: Omit<ResumeRecord, 'updatedAt'>
): Promise<ResumeRecord | null> {
  const email = record.email.toLowerCase();
  const data = {
    fileKey: record.fileKey,
    fileName: record.fileName,
    fileSize: record.fileSize,
    contentType: record.contentType,
    pageCount: record.pageCount,
    tags: JSON.stringify(record.tags),
    tagSource: record.tagSource,
  };

  try {
    const row = await prisma.resume.upsert({
      where: { email },
      update: data,
      create: { email, ...data },
    });
    return toRecord(row);
  } catch (error) {
    console.error('saveResumeRecord failed:', error);
    return null;
  }
}

export async function getResumeRecord(email: string): Promise<ResumeRecord | null> {
  try {
    const row = await prisma.resume.findUnique({ where: { email: email.toLowerCase() } });
    return row ? toRecord(row) : null;
  } catch (error) {
    console.error('getResumeRecord failed:', error);
    return null;
  }
}

export async function deleteResumeRecord(email: string): Promise<void> {
  try {
    await prisma.resume.deleteMany({ where: { email: email.toLowerCase() } });
  } catch (error) {
    console.error('deleteResumeRecord failed:', error);
  }
}
