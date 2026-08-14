/**
 * SQLite has no array column type, so list fields (skills, interests,
 * skillsNeeded) are stored as JSON strings. These helpers convert at the API
 * boundary so the frontend keeps seeing plain arrays.
 *
 * When the app moves to Postgres/Supabase, switch those fields back to
 * String[] in schema.prisma and delete this module.
 */

/** DB string -> array. Tolerates already-parsed arrays, null, and junk. */
export function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    // Legacy/hand-edited rows may hold a bare comma-separated list.
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

/** Array -> DB string. */
export function serializeList(value: unknown): string {
  if (Array.isArray(value)) {
    return JSON.stringify(value.filter((v): v is string => typeof v === 'string'));
  }
  if (typeof value === 'string' && value.trim()) {
    // Already-serialized JSON passes through unchanged.
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return value;
    } catch {
      /* fall through */
    }
  }
  return '[]';
}

/** Parse a JSON column holding an array of objects (e.g. idealTeam). */
export function parseObjectList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Expand a user row's JSON list columns into arrays for the client. */
export function deserializeUser<T extends Record<string, unknown>>(user: T | null) {
  if (!user) return user;
  return {
    ...user,
    skills: parseList(user.skills),
    interests: parseList(user.interests),
    idealTeam: parseObjectList<{ role: string; desc: string }>(user.idealTeam),
    // The DB stores these flat; the profile page reads them nested under `stats`.
    stats: {
      hackathons: Number(user.hackathons ?? 0),
      wins: Number(user.wins ?? 0),
      prizes: String(user.totalPrizes ?? '0'),
    },
  };
}
