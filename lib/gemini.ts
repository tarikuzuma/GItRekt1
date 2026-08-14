import {
  MAX_TAGS,
  ResumeTag,
  extractTagArray,
  extractTagsHeuristically,
  normalizeTags,
  parseTagResponse,
} from '@/lib/resume-tags';

/**
 * Google AI (Gemini) resume tagger, with an offline fallback so the feature
 * works before anyone has wired up an API key.
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export type TagSource = 'gemini' | 'heuristic';

export interface TaggingResult {
  tags: ResumeTag[];
  source: TagSource;
  model: string | null;
  /** Set when we wanted Gemini but fell back — surfaced in the UI. */
  warning?: string;
}

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || undefined;
}

export function isGeminiConfigured(): boolean {
  return Boolean(getApiKey());
}

const PROMPT = `You are parsing a resume to build a hackathon teammate-matching profile.

Extract the technical and collaborative skills this person can actually contribute to a hackathon team.

Rules:
- Only include skills evidenced by the resume. Do not invent or infer skills that are not supported by the text.
- Prefer specific technologies ("PostgreSQL", "React Native") over vague ones ("programming", "computers").
- Exclude: employer names, school names, job titles, dates, GPAs, locations, and personal details.
- Return at most ${MAX_TAGS} skills, most important first.
- "confidence" reflects how strongly the resume evidences the skill: 1.0 = built and shipped something substantial with it, 0.5 = listed in a skills section only.

Respond with JSON only, in exactly this shape:
{"tags":[{"label":"React","category":"framework","confidence":0.9}]}

"category" must be one of: language, framework, tool, domain, soft.

Resume text:
`;

function heuristicResult(text: string, warning?: string): TaggingResult {
  return {
    tags: extractTagsHeuristically(text),
    source: 'heuristic',
    model: null,
    ...(warning ? { warning } : {}),
  };
}

/**
 * Generate skill tags for resume text.
 *
 * Never throws: any Gemini failure degrades to keyword extraction so an upload
 * always returns something usable.
 */
export async function generateResumeTags(text: string): Promise<TaggingResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return heuristicResult(
      text,
      'GEMINI_API_KEY is not set — tags were extracted by keyword matching instead of AI.'
    );
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: PROMPT + text,
      config: {
        responseMimeType: 'application/json',
        // Low temperature: this is extraction, not creative writing.
        temperature: 0.2,
      },
    });

    const raw = response.text;
    const tags = normalizeTags(extractTagArray(parseTagResponse(raw ?? '')));

    if (tags.length === 0) {
      return heuristicResult(text, 'Gemini returned no usable tags — fell back to keyword matching.');
    }

    return { tags, source: 'gemini', model: MODEL };
  } catch (error) {
    console.error('Gemini tagging failed:', error);
    const detail = error instanceof Error ? error.message : 'unknown error';
    return heuristicResult(text, `Gemini call failed (${detail}) — fell back to keyword matching.`);
  }
}
