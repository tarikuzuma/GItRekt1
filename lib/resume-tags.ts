/**
 * Pure tag logic for resume parsing. No network, no env, no DB — so this stays
 * testable while the Supabase / Gemini credentials are still missing.
 */

export type TagCategory = 'language' | 'framework' | 'tool' | 'domain' | 'soft' | 'other';

export interface ResumeTag {
  label: string;
  category: TagCategory;
  /** 0..1. Gemini supplies this; the heuristic fallback estimates it. */
  confidence: number;
}

/** Hard ceiling on tags kept per resume, so one noisy CV can't flood a profile. */
export const MAX_TAGS = 24;

/** Longest a single tag may be before we treat it as a sentence fragment. */
const MAX_TAG_LENGTH = 40;

/**
 * Lowercase and strip punctuation, but keep `+` and `#` so `C++` and `C#`
 * don't both collapse into `c`.
 */
export function slugifyTag(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9+#]/g, '');
}

interface CanonicalEntry {
  label: string;
  category: TagCategory;
}

/**
 * Maps slugified aliases to the spelling we want to display. Anything not in
 * here still survives — it just keeps the casing the model gave us.
 */
const CANONICAL: Record<string, CanonicalEntry> = {
  // Languages
  javascript: { label: 'JavaScript', category: 'language' },
  js: { label: 'JavaScript', category: 'language' },
  typescript: { label: 'TypeScript', category: 'language' },
  ts: { label: 'TypeScript', category: 'language' },
  python: { label: 'Python', category: 'language' },
  py: { label: 'Python', category: 'language' },
  java: { label: 'Java', category: 'language' },
  kotlin: { label: 'Kotlin', category: 'language' },
  swift: { label: 'Swift', category: 'language' },
  'c++': { label: 'C++', category: 'language' },
  cpp: { label: 'C++', category: 'language' },
  'c#': { label: 'C#', category: 'language' },
  csharp: { label: 'C#', category: 'language' },
  c: { label: 'C', category: 'language' },
  go: { label: 'Go', category: 'language' },
  golang: { label: 'Go', category: 'language' },
  rust: { label: 'Rust', category: 'language' },
  ruby: { label: 'Ruby', category: 'language' },
  php: { label: 'PHP', category: 'language' },
  dart: { label: 'Dart', category: 'language' },
  sql: { label: 'SQL', category: 'language' },
  html: { label: 'HTML', category: 'language' },
  css: { label: 'CSS', category: 'language' },
  r: { label: 'R', category: 'language' },
  matlab: { label: 'MATLAB', category: 'language' },
  solidity: { label: 'Solidity', category: 'language' },

  // Frameworks / libraries
  react: { label: 'React', category: 'framework' },
  reactjs: { label: 'React', category: 'framework' },
  reactnative: { label: 'React Native', category: 'framework' },
  nextjs: { label: 'Next.js', category: 'framework' },
  next: { label: 'Next.js', category: 'framework' },
  vue: { label: 'Vue', category: 'framework' },
  vuejs: { label: 'Vue', category: 'framework' },
  nuxt: { label: 'Nuxt', category: 'framework' },
  angular: { label: 'Angular', category: 'framework' },
  svelte: { label: 'Svelte', category: 'framework' },
  nodejs: { label: 'Node.js', category: 'framework' },
  node: { label: 'Node.js', category: 'framework' },
  express: { label: 'Express', category: 'framework' },
  expressjs: { label: 'Express', category: 'framework' },
  nestjs: { label: 'NestJS', category: 'framework' },
  django: { label: 'Django', category: 'framework' },
  flask: { label: 'Flask', category: 'framework' },
  fastapi: { label: 'FastAPI', category: 'framework' },
  spring: { label: 'Spring', category: 'framework' },
  springboot: { label: 'Spring Boot', category: 'framework' },
  laravel: { label: 'Laravel', category: 'framework' },
  rails: { label: 'Ruby on Rails', category: 'framework' },
  flutter: { label: 'Flutter', category: 'framework' },
  tailwind: { label: 'Tailwind CSS', category: 'framework' },
  tailwindcss: { label: 'Tailwind CSS', category: 'framework' },
  bootstrap: { label: 'Bootstrap', category: 'framework' },
  tensorflow: { label: 'TensorFlow', category: 'framework' },
  pytorch: { label: 'PyTorch', category: 'framework' },
  keras: { label: 'Keras', category: 'framework' },
  pandas: { label: 'pandas', category: 'framework' },
  numpy: { label: 'NumPy', category: 'framework' },
  scikitlearn: { label: 'scikit-learn', category: 'framework' },
  sklearn: { label: 'scikit-learn', category: 'framework' },
  langchain: { label: 'LangChain', category: 'framework' },

  // Tools / platforms
  git: { label: 'Git', category: 'tool' },
  github: { label: 'GitHub', category: 'tool' },
  gitlab: { label: 'GitLab', category: 'tool' },
  docker: { label: 'Docker', category: 'tool' },
  kubernetes: { label: 'Kubernetes', category: 'tool' },
  k8s: { label: 'Kubernetes', category: 'tool' },
  aws: { label: 'AWS', category: 'tool' },
  gcp: { label: 'Google Cloud', category: 'tool' },
  googlecloud: { label: 'Google Cloud', category: 'tool' },
  azure: { label: 'Azure', category: 'tool' },
  vercel: { label: 'Vercel', category: 'tool' },
  netlify: { label: 'Netlify', category: 'tool' },
  supabase: { label: 'Supabase', category: 'tool' },
  firebase: { label: 'Firebase', category: 'tool' },
  postgresql: { label: 'PostgreSQL', category: 'tool' },
  postgres: { label: 'PostgreSQL', category: 'tool' },
  mysql: { label: 'MySQL', category: 'tool' },
  mongodb: { label: 'MongoDB', category: 'tool' },
  mongo: { label: 'MongoDB', category: 'tool' },
  redis: { label: 'Redis', category: 'tool' },
  prisma: { label: 'Prisma', category: 'tool' },
  graphql: { label: 'GraphQL', category: 'tool' },
  rest: { label: 'REST APIs', category: 'tool' },
  restapi: { label: 'REST APIs', category: 'tool' },
  figma: { label: 'Figma', category: 'tool' },
  canva: { label: 'Canva', category: 'tool' },
  blender: { label: 'Blender', category: 'tool' },
  unity: { label: 'Unity', category: 'tool' },
  arduino: { label: 'Arduino', category: 'tool' },
  raspberrypi: { label: 'Raspberry Pi', category: 'tool' },
  linux: { label: 'Linux', category: 'tool' },
  jest: { label: 'Jest', category: 'tool' },
  postman: { label: 'Postman', category: 'tool' },

  // Domains
  machinelearning: { label: 'Machine Learning', category: 'domain' },
  ml: { label: 'Machine Learning', category: 'domain' },
  ai: { label: 'AI', category: 'domain' },
  artificialintelligence: { label: 'AI', category: 'domain' },
  deeplearning: { label: 'Deep Learning', category: 'domain' },
  nlp: { label: 'NLP', category: 'domain' },
  computervision: { label: 'Computer Vision', category: 'domain' },
  datascience: { label: 'Data Science', category: 'domain' },
  dataanalysis: { label: 'Data Analysis', category: 'domain' },
  cybersecurity: { label: 'Cybersecurity', category: 'domain' },
  blockchain: { label: 'Blockchain', category: 'domain' },
  web3: { label: 'Web3', category: 'domain' },
  devops: { label: 'DevOps', category: 'domain' },
  frontend: { label: 'Frontend', category: 'domain' },
  backend: { label: 'Backend', category: 'domain' },
  fullstack: { label: 'Full Stack', category: 'domain' },
  mobiledevelopment: { label: 'Mobile Development', category: 'domain' },
  mobiledev: { label: 'Mobile Development', category: 'domain' },
  uiux: { label: 'UI/UX Design', category: 'domain' },
  uxdesign: { label: 'UI/UX Design', category: 'domain' },
  uidesign: { label: 'UI/UX Design', category: 'domain' },
  gamedevelopment: { label: 'Game Development', category: 'domain' },
  gamedev: { label: 'Game Development', category: 'domain' },
  iot: { label: 'IoT', category: 'domain' },
  embedded: { label: 'Embedded Systems', category: 'domain' },

  // Soft skills
  leadership: { label: 'Leadership', category: 'soft' },
  teamwork: { label: 'Teamwork', category: 'soft' },
  projectmanagement: { label: 'Project Management', category: 'soft' },
  publicspeaking: { label: 'Public Speaking', category: 'soft' },
  communication: { label: 'Communication', category: 'soft' },
  agile: { label: 'Agile', category: 'soft' },
  scrum: { label: 'Scrum', category: 'soft' },
};

/**
 * Resolve a raw model-supplied tag to its canonical spelling. Returns null for
 * anything that isn't usable as a tag (empty, numeric, sentence-length).
 */
export function canonicalizeTag(raw: string): CanonicalEntry | null {
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (!trimmed || trimmed.length > MAX_TAG_LENGTH) return null;

  // Pure numbers ("2024", "3.5") are dates and GPAs, not skills.
  if (/^[\d.\s%]+$/.test(trimmed)) return null;

  const slug = slugifyTag(trimmed);
  if (!slug) return null;

  return CANONICAL[slug] ?? { label: trimmed, category: 'other' };
}

function clampConfidence(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function isCategory(value: unknown): value is TagCategory {
  return (
    value === 'language' ||
    value === 'framework' ||
    value === 'tool' ||
    value === 'domain' ||
    value === 'soft' ||
    value === 'other'
  );
}

/**
 * Turn whatever the model returned into a clean, deduped, capped tag list.
 * Accepts plain strings or `{ label, category?, confidence? }` objects, since
 * model output drifts between the two.
 */
export function normalizeTags(input: unknown, maxTags: number = MAX_TAGS): ResumeTag[] {
  if (!Array.isArray(input)) return [];

  const bySlug = new Map<string, ResumeTag>();

  for (const item of input) {
    let rawLabel: unknown;
    let rawCategory: unknown;
    let rawConfidence: unknown;

    if (typeof item === 'string') {
      rawLabel = item;
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      rawLabel = obj.label ?? obj.tag ?? obj.name ?? obj.skill;
      rawCategory = obj.category ?? obj.type;
      rawConfidence = obj.confidence ?? obj.score;
    } else {
      continue;
    }

    if (typeof rawLabel !== 'string') continue;

    const canonical = canonicalizeTag(rawLabel);
    if (!canonical) continue;

    const category = isCategory(rawCategory) && canonical.category === 'other'
      ? rawCategory
      : canonical.category;

    const tag: ResumeTag = {
      label: canonical.label,
      category,
      confidence: clampConfidence(rawConfidence),
    };

    // Dedupe on the canonical label so "ReactJS" and "react" collapse into one.
    const key = slugifyTag(canonical.label);
    const existing = bySlug.get(key);
    if (!existing || tag.confidence > existing.confidence) {
      bySlug.set(key, tag);
    }
  }

  return Array.from(bySlug.values())
    .sort((a, b) => b.confidence - a.confidence || a.label.localeCompare(b.label))
    .slice(0, maxTags);
}

/**
 * Pull JSON out of a model response. Handles bare JSON, ```json fences, and
 * responses with prose wrapped around the object.
 */
export function parseTagResponse(text: string): unknown {
  if (typeof text !== 'string' || !text.trim()) return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the outermost {...} or [...] in the string.
    const start = candidate.search(/[[{]/);
    if (start === -1) return null;
    const opener = candidate[start];
    const closer = opener === '[' ? ']' : '}';
    const end = candidate.lastIndexOf(closer);
    if (end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

/**
 * Read a tag array out of a parsed response, tolerating the common shapes
 * (`[...]`, `{ tags: [...] }`, `{ skills: [...] }`).
 */
export function extractTagArray(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    for (const key of ['tags', 'skills', 'results', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

/**
 * Offline tag extraction: scan resume text for known technologies. Used when
 * GEMINI_API_KEY isn't configured so the feature still demos end to end.
 */
export function extractTagsHeuristically(text: string, maxTags: number = MAX_TAGS): ResumeTag[] {
  if (typeof text !== 'string' || !text.trim()) return [];

  const haystack = text.toLowerCase();
  const found: { label: string; category: TagCategory; confidence: number }[] = [];
  const seen = new Set<string>();

  for (const [slug, entry] of Object.entries(CANONICAL)) {
    if (seen.has(entry.label)) continue;

    // Single-letter slugs ("c", "r") match far too much prose to be useful
    // here. Gemini still picks those up; keyword matching skips them.
    if (slug.length < 2) continue;

    // Escape each character individually, then join — escaping the whole slug
    // first would corrupt the backslashes when we split it apart.
    const spaced = slug
      .split('')
      .map((ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      // Optional separator between characters so "nextjs" also matches
      // "Next.js" and "next js" in the source text.
      .join('[\\s.\\-_]?');

    const pattern = new RegExp(`(?<![a-z0-9])${spaced}(?![a-z0-9])`, 'gi');
    const occurrences = haystack.match(pattern)?.length ?? 0;

    if (occurrences > 0) {
      found.push({
        label: entry.label,
        category: entry.category,
        // More mentions => more confidence, capped well below a real model's.
        confidence: Math.min(0.85, 0.45 + occurrences * 0.1),
      });
      seen.add(entry.label);
    }
  }

  return found
    .sort((a, b) => b.confidence - a.confidence || a.label.localeCompare(b.label))
    .slice(0, maxTags);
}
