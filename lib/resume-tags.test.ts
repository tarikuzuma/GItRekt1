import {
  MAX_TAGS,
  canonicalizeTag,
  extractTagArray,
  extractTagsHeuristically,
  normalizeTags,
  parseTagResponse,
  slugifyTag,
} from './resume-tags';

describe('slugifyTag', () => {
  it('keeps + and # so C++ and C# stay distinct from C', () => {
    expect(slugifyTag('C++')).toBe('c++');
    expect(slugifyTag('C#')).toBe('c#');
    expect(slugifyTag('C')).toBe('c');
  });

  it('strips punctuation and spacing', () => {
    expect(slugifyTag('Next.js')).toBe('nextjs');
    expect(slugifyTag('  Node JS ')).toBe('nodejs');
    expect(slugifyTag('scikit-learn')).toBe('scikitlearn');
  });
});

describe('canonicalizeTag', () => {
  it('maps known aliases to a canonical spelling', () => {
    expect(canonicalizeTag('reactjs')).toEqual({ label: 'React', category: 'framework' });
    expect(canonicalizeTag('POSTGRES')).toEqual({ label: 'PostgreSQL', category: 'tool' });
    expect(canonicalizeTag('golang')).toEqual({ label: 'Go', category: 'language' });
  });

  it('passes through unknown skills as "other"', () => {
    expect(canonicalizeTag('Bayanihan Ops')).toEqual({
      label: 'Bayanihan Ops',
      category: 'other',
    });
  });

  it('rejects dates, GPAs and empty input', () => {
    expect(canonicalizeTag('2024')).toBeNull();
    expect(canonicalizeTag('3.5')).toBeNull();
    expect(canonicalizeTag('   ')).toBeNull();
    expect(canonicalizeTag('')).toBeNull();
  });

  it('rejects sentence-length strings', () => {
    expect(canonicalizeTag('Led a team of five engineers building a payments platform')).toBeNull();
  });
});

describe('normalizeTags', () => {
  it('accepts bare strings', () => {
    const tags = normalizeTags(['React', 'python']);
    expect(tags.map((t) => t.label).sort()).toEqual(['Python', 'React']);
  });

  it('accepts objects and preserves confidence', () => {
    const tags = normalizeTags([{ label: 'React', confidence: 0.9 }]);
    expect(tags[0]).toEqual({ label: 'React', category: 'framework', confidence: 0.9 });
  });

  it('dedupes aliases, keeping the highest confidence', () => {
    const tags = normalizeTags([
      { label: 'react', confidence: 0.4 },
      { label: 'ReactJS', confidence: 0.95 },
      { label: 'React', confidence: 0.6 },
    ]);
    expect(tags).toHaveLength(1);
    expect(tags[0].confidence).toBe(0.95);
  });

  it('sorts by confidence descending', () => {
    const tags = normalizeTags([
      { label: 'Docker', confidence: 0.3 },
      { label: 'TypeScript', confidence: 0.9 },
    ]);
    expect(tags.map((t) => t.label)).toEqual(['TypeScript', 'Docker']);
  });

  it('clamps out-of-range and non-numeric confidence', () => {
    expect(normalizeTags([{ label: 'Go', confidence: 5 }])[0].confidence).toBe(1);
    expect(normalizeTags([{ label: 'Go', confidence: -2 }])[0].confidence).toBe(0);
    expect(normalizeTags([{ label: 'Go', confidence: 'high' }])[0].confidence).toBe(0.5);
  });

  it('caps the tag count', () => {
    const many = Array.from({ length: 60 }, (_, i) => `Skill${i}`);
    expect(normalizeTags(many)).toHaveLength(MAX_TAGS);
    expect(normalizeTags(many, 5)).toHaveLength(5);
  });

  it('returns an empty array for junk input', () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags('React')).toEqual([]);
    expect(normalizeTags([null, 42, undefined, {}])).toEqual([]);
  });

  it('only honours a model-supplied category for unknown skills', () => {
    // React is known — the dictionary wins over the model's guess.
    expect(normalizeTags([{ label: 'React', category: 'soft' }])[0].category).toBe('framework');
    // Unknown skill — trust the model.
    expect(normalizeTags([{ label: 'Debate', category: 'soft' }])[0].category).toBe('soft');
  });
});

describe('parseTagResponse', () => {
  it('parses bare JSON', () => {
    expect(parseTagResponse('{"tags":["React"]}')).toEqual({ tags: ['React'] });
  });

  it('parses fenced JSON', () => {
    expect(parseTagResponse('```json\n{"tags":["Go"]}\n```')).toEqual({ tags: ['Go'] });
    expect(parseTagResponse('```\n["Go"]\n```')).toEqual(['Go']);
  });

  it('recovers JSON wrapped in prose', () => {
    expect(parseTagResponse('Sure! {"tags":["Rust"]} Hope that helps.')).toEqual({
      tags: ['Rust'],
    });
  });

  it('returns null when there is nothing parseable', () => {
    expect(parseTagResponse('I could not read the resume.')).toBeNull();
    expect(parseTagResponse('')).toBeNull();
    expect(parseTagResponse('{broken')).toBeNull();
  });
});

describe('extractTagArray', () => {
  it('handles the shapes models actually return', () => {
    expect(extractTagArray(['React'])).toEqual(['React']);
    expect(extractTagArray({ tags: ['React'] })).toEqual(['React']);
    expect(extractTagArray({ skills: ['React'] })).toEqual(['React']);
    expect(extractTagArray({ nope: 1 })).toEqual([]);
    expect(extractTagArray(null)).toEqual([]);
  });
});

describe('extractTagsHeuristically', () => {
  const resume = `
    Juan Dela Cruz — BS Computer Science, University of the Philippines
    Built a logistics dashboard with React, Next.js and TypeScript.
    Backend in Node.js with PostgreSQL, deployed on Vercel.
    Machine learning coursework using Python and TensorFlow.
  `;

  it('finds technologies mentioned in the text', () => {
    const labels = extractTagsHeuristically(resume).map((t) => t.label);
    expect(labels).toEqual(expect.arrayContaining(['React', 'Next.js', 'TypeScript']));
    expect(labels).toEqual(expect.arrayContaining(['Node.js', 'PostgreSQL', 'Vercel']));
    expect(labels).toEqual(expect.arrayContaining(['Python', 'TensorFlow', 'Machine Learning']));
  });

  it('does not invent technologies that are absent', () => {
    const labels = extractTagsHeuristically(resume).map((t) => t.label);
    expect(labels).not.toContain('Rust');
    expect(labels).not.toContain('Kubernetes');
  });

  it('matches punctuation variants of the same technology', () => {
    const labels = extractTagsHeuristically('Experienced in next js and node-js').map(
      (t) => t.label
    );
    expect(labels).toContain('Next.js');
    expect(labels).toContain('Node.js');
  });

  it('handles C++ without the regex escaping breaking', () => {
    const labels = extractTagsHeuristically('Competitive programming in C++ since 2019').map(
      (t) => t.label
    );
    expect(labels).toContain('C++');
  });

  it('does not match a technology inside a longer word', () => {
    const labels = extractTagsHeuristically('I enjoy going to reactions and golanguages').map(
      (t) => t.label
    );
    expect(labels).not.toContain('React');
    expect(labels).not.toContain('Go');
  });

  it('scores repeated mentions higher than single ones', () => {
    const tags = extractTagsHeuristically('React React React. Also some Docker.');
    const react = tags.find((t) => t.label === 'React')!;
    const docker = tags.find((t) => t.label === 'Docker')!;
    expect(react.confidence).toBeGreaterThan(docker.confidence);
  });

  it('returns nothing for empty input', () => {
    expect(extractTagsHeuristically('')).toEqual([]);
    expect(extractTagsHeuristically('   ')).toEqual([]);
  });

  it('respects the tag cap', () => {
    expect(extractTagsHeuristically(resume, 3)).toHaveLength(3);
  });
});
