/**
 * Resume file storage with two drivers:
 *
 *   supabase — used when Supabase credentials exist (the real deployment path)
 *   local    — writes to ./.uploads so the feature runs before any secrets land
 *
 * Node built-ins are imported lazily so the pure helpers here stay importable
 * from a jsdom test environment.
 */

export type StorageDriver = 'supabase' | 'local';

export const RESUME_BUCKET = 'resumes';

/** Where the local driver writes. Gitignored. */
const LOCAL_DIR = '.uploads';

export interface StoredFile {
  key: string;
  driver: StorageDriver;
  size: number;
  contentType: string;
}

export class StorageError extends Error {
  readonly status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'StorageError';
    this.status = status;
  }
}

function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

/**
 * Prefer the service-role key: the bucket is private, and uploading + signing
 * on the server shouldn't depend on RLS policies being set up perfectly.
 */
function supabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    undefined
  );
}

export function getStorageDriver(): StorageDriver {
  return supabaseUrl() && supabaseKey() ? 'supabase' : 'local';
}

/** Non-cryptographic hash (FNV-1a). Only used to namespace paths per user. */
function hashEmail(email: string): string {
  let hash = 0x811c9dc5;
  const normalized = email.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Build a storage key for a user's resume. The email is hashed rather than
 * embedded so storage paths don't leak addresses.
 */
export function buildResumeKey(email: string, fileName: string, now: number = Date.now()): string {
  const safeName =
    fileName
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, '-')
      // Collapse dot runs so a name like "../../etc/passwd" can't leave a
      // literal ".." behind after the separators are swapped out.
      .replace(/\.{2,}/g, '.')
      .slice(-60)
      .replace(/^[-.]+|[-.]+$/g, '') || 'resume.pdf';

  return `${hashEmail(email)}/${now}-${safeName}`;
}

/**
 * Guard against path traversal before a key ever touches the filesystem.
 * Keys are exactly `<8-hex>/<filename>`.
 */
export function assertSafeKey(key: string): void {
  if (typeof key !== 'string' || !/^[0-9a-f]{8}\/[a-zA-Z0-9._-]{1,80}$/.test(key)) {
    throw new StorageError('Invalid resume key.', 400);
  }
  if (key.includes('..')) {
    throw new StorageError('Invalid resume key.', 400);
  }
}

async function getSupabaseAdmin() {
  const url = supabaseUrl();
  const key = supabaseKey();
  if (!url || !key) throw new StorageError('Supabase is not configured.');

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, { auth: { persistSession: false } });
}

async function localPathFor(key: string): Promise<string> {
  assertSafeKey(key);
  const path = await import('node:path');
  const root = path.resolve(process.cwd(), LOCAL_DIR, RESUME_BUCKET);
  const resolved = path.resolve(root, key);

  // Belt and braces: even with a validated key, never escape the upload root.
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new StorageError('Invalid resume key.', 400);
  }
  return resolved;
}

export async function putResume(
  key: string,
  bytes: Uint8Array,
  contentType: string
): Promise<StoredFile> {
  assertSafeKey(key);
  const driver = getStorageDriver();

  if (driver === 'supabase') {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(key, bytes, { contentType, upsert: true });

    if (error) {
      // The most common first-run failure is a missing bucket — say so plainly.
      const hint = /bucket/i.test(error.message)
        ? ` (create a private bucket named "${RESUME_BUCKET}" in Supabase Storage)`
        : '';
      throw new StorageError(`Upload failed: ${error.message}${hint}`);
    }
  } else {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const target = await localPathFor(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  }

  return { key, driver, size: bytes.byteLength, contentType };
}

/**
 * A URL the browser can use to open the resume. Supabase gets a short-lived
 * signed URL (the bucket is private); local goes through our own route.
 */
export async function getResumeUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  assertSafeKey(key);

  if (getStorageDriver() === 'supabase') {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUrl(key, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new StorageError(`Could not sign resume URL: ${error?.message ?? 'no URL returned'}`);
    }
    return data.signedUrl;
  }

  return `/api/user/resume/file?key=${encodeURIComponent(key)}`;
}

export async function readResume(
  key: string
): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  assertSafeKey(key);

  if (getStorageDriver() === 'supabase') {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(RESUME_BUCKET).download(key);
    if (error || !data) return null;
    return {
      bytes: new Uint8Array(await data.arrayBuffer()),
      contentType: data.type || 'application/octet-stream',
    };
  }

  const fs = await import('node:fs/promises');
  const target = await localPathFor(key);
  try {
    const buffer = await fs.readFile(target);
    return {
      bytes: new Uint8Array(buffer),
      contentType: key.endsWith('.pdf') ? 'application/pdf' : 'text/plain',
    };
  } catch {
    return null;
  }
}

export async function removeResume(key: string): Promise<void> {
  assertSafeKey(key);

  if (getStorageDriver() === 'supabase') {
    const supabase = await getSupabaseAdmin();
    await supabase.storage.from(RESUME_BUCKET).remove([key]);
    return;
  }

  const fs = await import('node:fs/promises');
  const target = await localPathFor(key);
  await fs.rm(target, { force: true });
}
