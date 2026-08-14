import { NextResponse } from 'next/server';

import { generateResumeTags, isGeminiConfigured } from '@/lib/gemini';
import {
  ResumeValidationError,
  assertValidResumeFile,
  extractResumeText,
} from '@/lib/resume-extract';
import { deleteResumeRecord, getResumeRecord, saveResumeRecord } from '@/lib/resume-store';
import {
  StorageError,
  buildResumeKey,
  getResumeUrl,
  getStorageDriver,
  putResume,
  removeResume,
} from '@/lib/storage';

// unpdf and node:fs both need the Node runtime, not Edge.
export const runtime = 'nodejs';

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ResumeValidationError || error instanceof StorageError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  // Surface the underlying reason: a bare "Failed to process resume." gives you
  // nothing to go on when this happens in a deployment you can't attach to.
  const detail = error instanceof Error ? error.message : String(error);
  return NextResponse.json({ error: `${fallback} (${detail})` }, { status: 500 });
}

/**
 * POST — upload a resume, extract its text, and generate skill tags from it.
 *
 * Body: multipart/form-data with `file` and `email`.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const email = formData.get('email');

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    assertValidResumeFile({ size: file.size, type: file.type, name: file.name });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extraction = await extractResumeText(bytes, file.type, file.name);

    // Tag first: if this fails we don't want an orphaned file in storage.
    const tagging = await generateResumeTags(extraction.text);

    const contentType = file.type || 'application/pdf';
    const key = buildResumeKey(email, file.name);

    // Storing the file is best-effort. The tags are the point of this feature,
    // and serverless hosts have a read-only filesystem — so if the write fails
    // we still return the tags rather than losing the whole upload.
    let storedKey = '';
    let storageWarning: string | undefined;

    try {
      const stored = await putResume(key, bytes, contentType);
      storedKey = stored.key;
    } catch (error) {
      if (error instanceof StorageError) {
        storageWarning = `Tags extracted, but the file itself was not saved. ${error.message}`;
      } else {
        throw error;
      }
    }

    const record = {
      email: email.toLowerCase(),
      fileKey: storedKey,
      fileName: file.name,
      fileSize: bytes.byteLength,
      contentType,
      pageCount: extraction.pageCount,
      tags: tagging.tags,
      tagSource: tagging.source,
    };

    // Best-effort: returns null when Supabase isn't wired up yet.
    const persisted = await saveResumeRecord(record);

    // No URL when the file wasn't stored — the UI hides the "View" button.
    let url: string | null = null;
    if (storedKey) {
      try {
        url = await getResumeUrl(storedKey);
      } catch (error) {
        console.error('Could not build resume URL:', error);
      }
    }

    return NextResponse.json({
      resume: {
        ...record,
        updatedAt: persisted?.updatedAt ?? new Date().toISOString(),
        url,
      },
      tagSource: tagging.source,
      model: tagging.model,
      // Storage problems matter more to the user than the tag-source note.
      warning: storageWarning ?? tagging.warning,
      truncated: extraction.truncated,
      persisted: persisted !== null,
      storageDriver: getStorageDriver(),
    });
  } catch (error) {
    return errorResponse(error, 'Failed to process resume.');
  }
}

/** GET — fetch the stored resume record for a user, with a fresh file URL. */
export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const record = await getResumeRecord(email);
    if (!record) {
      return NextResponse.json({
        resume: null,
        storageDriver: getStorageDriver(),
        geminiConfigured: isGeminiConfigured(),
      });
    }

    let url: string | null = null;
    try {
      url = await getResumeUrl(record.fileKey);
    } catch (error) {
      // A missing file shouldn't hide the tags we already extracted.
      console.error('Could not build resume URL:', error);
    }

    return NextResponse.json({
      resume: { ...record, url },
      storageDriver: getStorageDriver(),
      geminiConfigured: isGeminiConfigured(),
    });
  } catch (error) {
    return errorResponse(error, 'Failed to fetch resume.');
  }
}

/** DELETE — remove a user's resume file and record. */
export async function DELETE(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const email = params.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // With the local driver there's no DB record to look the key up in, so the
    // client passes the key it has cached.
    const record = await getResumeRecord(email);
    const fileKey = record?.fileKey ?? params.get('key');
    if (fileKey) {
      await removeResume(fileKey);
    }
    await deleteResumeRecord(email);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Failed to delete resume.');
  }
}
