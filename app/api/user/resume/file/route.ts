import { NextResponse } from 'next/server';

import { StorageError, getStorageDriver, readResume } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * Serves resume files for the LOCAL storage driver only.
 *
 * Once Supabase credentials exist, resumes are served by short-lived signed
 * URLs instead and this route refuses to run — so it can never become an
 * unauthenticated way to read files out of a real deployment.
 */
export async function GET(request: Request) {
  if (getStorageDriver() !== 'local') {
    return NextResponse.json(
      { error: 'Not available: resumes are served via signed Supabase URLs.' },
      { status: 404 }
    );
  }

  const key = new URL(request.url).searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Key required' }, { status: 400 });
  }

  try {
    const file = await readResume(key);
    if (!file) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return new NextResponse(Buffer.from(file.bytes), {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Resume file read failed:', error);
    return NextResponse.json({ error: 'Failed to read resume' }, { status: 500 });
  }
}
