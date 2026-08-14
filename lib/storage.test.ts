import { assertSafeKey, buildResumeKey } from './storage';

describe('buildResumeKey', () => {
  it('namespaces by a hash of the email rather than the address itself', () => {
    const key = buildResumeKey('juan@up.edu.ph', 'resume.pdf', 1700000000000);
    expect(key).not.toContain('juan');
    expect(key).not.toContain('@');
    expect(key).toMatch(/^[0-9a-f]{8}\/1700000000000-resume\.pdf$/);
  });

  it('is stable for the same email and varies across emails', () => {
    const a = buildResumeKey('a@x.com', 'r.pdf', 1).split('/')[0];
    const b = buildResumeKey('A@X.COM', 'r.pdf', 2).split('/')[0];
    const c = buildResumeKey('c@x.com', 'r.pdf', 1).split('/')[0];
    expect(a).toBe(b); // case-insensitive
    expect(a).not.toBe(c);
  });

  it('sanitises hostile filenames into something safe', () => {
    const key = buildResumeKey('a@x.com', '../../etc/passwd', 1);
    expect(key).not.toContain('..');
    expect(() => assertSafeKey(key)).not.toThrow();
  });

  it('handles spaces and unicode in filenames', () => {
    const key = buildResumeKey('a@x.com', 'Résumé Final (v2).pdf', 1);
    expect(() => assertSafeKey(key)).not.toThrow();
  });

  it('falls back to a default name when nothing usable survives', () => {
    const key = buildResumeKey('a@x.com', '???', 1);
    expect(key).toBe(key.split('/')[0] + '/1-resume.pdf');
  });
});

describe('assertSafeKey', () => {
  it('accepts keys produced by buildResumeKey', () => {
    expect(() => assertSafeKey(buildResumeKey('a@x.com', 'cv.pdf'))).not.toThrow();
  });

  it('rejects path traversal', () => {
    expect(() => assertSafeKey('../../../etc/passwd')).toThrow();
    expect(() => assertSafeKey('abcd1234/../../secret')).toThrow();
    expect(() => assertSafeKey('abcd1234/..')).toThrow();
  });

  it('rejects absolute paths and extra segments', () => {
    expect(() => assertSafeKey('/etc/passwd')).toThrow();
    expect(() => assertSafeKey('C:\\Windows\\system32')).toThrow();
    expect(() => assertSafeKey('abcd1234/nested/file.pdf')).toThrow();
  });

  it('rejects malformed and non-string keys', () => {
    expect(() => assertSafeKey('')).toThrow();
    expect(() => assertSafeKey('nothashed/file.pdf')).toThrow();
    expect(() => assertSafeKey(undefined as unknown as string)).toThrow();
  });
});
