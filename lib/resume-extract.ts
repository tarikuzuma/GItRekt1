/**
 * Resume file validation + text extraction. Text is pulled out once here, then
 * reused for both the Gemini call and the offline fallback tagger.
 */

/** Upload ceiling. Resumes are 1-2 pages; anything bigger is a mistake. */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB

/** Cap the text handed to the model so a novel-length PDF can't blow the budget. */
export const MAX_EXTRACTED_CHARS = 20_000;

export const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
] as const;

export interface ExtractionResult {
  text: string;
  pageCount: number | null;
  truncated: boolean;
}

export class ResumeValidationError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ResumeValidationError';
    this.status = status;
  }
}

/**
 * Reject files we can't read before spending time on them. `.docx` is called
 * out by name because it's the most common thing users will try.
 */
export function assertValidResumeFile(file: { size: number; type: string; name: string }): void {
  if (file.size === 0) {
    throw new ResumeValidationError('That file is empty.');
  }

  if (file.size > MAX_RESUME_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    throw new ResumeValidationError(`Resume is ${mb} MB. Maximum is 5 MB.`);
  }

  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  const looksAccepted =
    (ACCEPTED_MIME_TYPES as readonly string[]).includes(type) ||
    name.endsWith('.pdf') ||
    name.endsWith('.txt') ||
    name.endsWith('.md');

  if (!looksAccepted) {
    if (name.endsWith('.docx') || name.endsWith('.doc')) {
      throw new ResumeValidationError(
        'Word documents are not supported yet. Export your resume as PDF and try again.'
      );
    }
    throw new ResumeValidationError('Upload a PDF, .txt, or .md file.');
  }
}

function isPdf(bytes: Uint8Array, mimeType: string, fileName: string): boolean {
  // Trust the magic bytes over the declared type — browsers lie about MIME.
  if (bytes.length >= 4) {
    const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (header === '%PDF') return true;
  }
  return mimeType.toLowerCase() === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
}

/** Collapse the whitespace soup that PDF extraction usually produces. */
function tidy(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract plain text from a resume buffer. PDFs go through unpdf; everything
 * else is decoded as UTF-8.
 */
export async function extractResumeText(
  bytes: Uint8Array,
  mimeType: string,
  fileName: string
): Promise<ExtractionResult> {
  let text: string;
  let pageCount: number | null = null;

  if (isPdf(bytes, mimeType, fileName)) {
    // Imported lazily: unpdf pulls in a sizeable pdf.js build, and the .txt
    // path shouldn't pay for it.
    const { extractText, getDocumentProxy } = await import('unpdf');
    try {
      // pdf.js takes ownership of the array it's handed and detaches the
      // underlying buffer, so give it a copy — the caller still needs these
      // bytes to write the file to storage afterwards.
      const pdf = await getDocumentProxy(new Uint8Array(bytes));
      const result = await extractText(pdf, { mergePages: true });
      text = Array.isArray(result.text) ? result.text.join('\n\n') : result.text;
      pageCount = result.totalPages ?? null;
    } catch (error) {
      console.error('PDF extraction failed:', error);
      throw new ResumeValidationError(
        'Could not read that PDF. It may be password-protected or corrupted.'
      );
    }
  } else {
    text = new TextDecoder('utf-8').decode(bytes);
  }

  const tidied = tidy(text);

  if (tidied.length < 50) {
    throw new ResumeValidationError(
      'Barely any text in that file. If your resume is a scanned image, upload a text-based PDF instead.'
    );
  }

  const truncated = tidied.length > MAX_EXTRACTED_CHARS;

  return {
    text: truncated ? tidied.slice(0, MAX_EXTRACTED_CHARS) : tidied,
    pageCount,
    truncated,
  };
}
