/**
 * @jest-environment node
 *
 * End-to-end check of the resume pipeline against a real PDF: extraction →
 * tagging → storage round-trip. Runs entirely offline (no Gemini key, local
 * storage driver), so it works in CI and on a laptop with no secrets.
 */

import { ResumeValidationError, assertValidResumeFile, extractResumeText } from './resume-extract';
import { generateResumeTags } from './gemini';
import { buildResumeKey, getStorageDriver, putResume, readResume, removeResume } from './storage';

/** Minimal single-page PDF with real, extractable text. */
function buildPdf(lines: string[]): Uint8Array {
  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const ops = lines
    .map((l, i) => `BT /F1 11 Tf 50 ${760 - i * 18} Td (${escape(l)}) Tj ET`)
    .join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(ops)} >>\nstream\n${ops}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    pdf += `${String(o).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new Uint8Array(Buffer.from(pdf, 'latin1'));
}

const RESUME_LINES = [
  'Juan Dela Cruz',
  'BS Computer Science, University of the Philippines Diliman',
  'EXPERIENCE',
  'Built a logistics dashboard with React, Next.js and TypeScript.',
  'Backend services in Node.js and Express, backed by PostgreSQL.',
  'Containerised with Docker and deployed on Vercel.',
  'PROJECTS',
  'Jeepney route optimiser - Python, TensorFlow, machine learning.',
  'Competitive programming in C++ since 2019.',
  'SKILLS',
  'JavaScript, TypeScript, Python, Supabase, Git, Figma, Tailwind CSS',
];

const pdfBytes = buildPdf(RESUME_LINES);

describe('resume pipeline (offline)', () => {
  const createdKeys: string[] = [];

  afterAll(async () => {
    await Promise.all(createdKeys.map((k) => removeResume(k).catch(() => {})));
  });

  it('extracts text from a real PDF', async () => {
    const result = await extractResumeText(pdfBytes, 'application/pdf', 'resume.pdf');

    expect(result.pageCount).toBe(1);
    expect(result.truncated).toBe(false);
    expect(result.text).toContain('Juan Dela Cruz');
    expect(result.text).toContain('React');
    expect(result.text).toContain('PostgreSQL');
  });

  it('detects PDFs by magic bytes even when the MIME type is wrong', async () => {
    const result = await extractResumeText(pdfBytes, 'application/octet-stream', 'resume.bin');
    expect(result.text).toContain('TypeScript');
  });

  it('reads plain text files too', async () => {
    const bytes = new Uint8Array(Buffer.from(RESUME_LINES.join('\n'), 'utf-8'));
    const result = await extractResumeText(bytes, 'text/plain', 'resume.txt');

    expect(result.pageCount).toBeNull();
    expect(result.text).toContain('Docker');
  });

  it('produces sensible tags without a Gemini key', async () => {
    expect(process.env.GEMINI_API_KEY).toBeFalsy();

    const { text } = await extractResumeText(pdfBytes, 'application/pdf', 'resume.pdf');
    const result = await generateResumeTags(text);

    expect(result.source).toBe('heuristic');
    expect(result.warning).toMatch(/GEMINI_API_KEY/);

    const labels = result.tags.map((t) => t.label);
    expect(labels).toEqual(expect.arrayContaining(['React', 'Next.js', 'TypeScript', 'Python']));
    expect(labels).toEqual(expect.arrayContaining(['PostgreSQL', 'Docker', 'C++', 'Supabase']));

    // Should not turn the school or the person into a skill.
    expect(labels).not.toContain('Juan Dela Cruz');
    expect(labels.join(' ')).not.toMatch(/Diliman/);
  });

  it('rejects files it cannot read, with an actionable message', () => {
    expect(() => assertValidResumeFile({ size: 1000, type: '', name: 'cv.docx' })).toThrow(
      /Export your resume as PDF/
    );
    expect(() => assertValidResumeFile({ size: 0, type: 'application/pdf', name: 'cv.pdf' })).toThrow(
      /empty/
    );
    expect(() =>
      assertValidResumeFile({ size: 9 * 1024 * 1024, type: 'application/pdf', name: 'cv.pdf' })
    ).toThrow(/Maximum is 5 MB/);
  });

  it('rejects a PDF with no extractable text', async () => {
    const blank = buildPdf(['x']);
    await expect(extractResumeText(blank, 'application/pdf', 'blank.pdf')).rejects.toBeInstanceOf(
      ResumeValidationError
    );
  });

  it('stores and retrieves the file byte-for-byte', async () => {
    expect(getStorageDriver()).toBe('local');

    const key = buildResumeKey('juan@up.edu.ph', 'resume.pdf');
    createdKeys.push(key);

    const stored = await putResume(key, pdfBytes, 'application/pdf');
    expect(stored.driver).toBe('local');
    expect(stored.size).toBe(pdfBytes.byteLength);

    const readBack = await readResume(key);
    expect(readBack).not.toBeNull();
    expect(Buffer.from(readBack!.bytes).equals(Buffer.from(pdfBytes))).toBe(true);
  });

  it('returns null for a key that was never written', async () => {
    expect(await readResume('deadbeef/missing.pdf')).toBeNull();
  });
});
