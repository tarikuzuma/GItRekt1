'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ResumeTag {
  label: string;
  category: 'language' | 'framework' | 'tool' | 'domain' | 'soft' | 'other';
  confidence: number;
}

interface ResumeData {
  fileKey: string;
  fileName: string;
  fileSize: number;
  pageCount: number | null;
  tags: ResumeTag[];
  tagSource: 'gemini' | 'heuristic';
  updatedAt: string;
  url: string | null;
}

/** Mirrors the profile page's own localStorage-first approach. */
const CACHE_KEY = 'hackmatch_user_resume';

const CATEGORY_STYLES: Record<ResumeTag['category'], string> = {
  language: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  framework: 'bg-primary-container/20 text-primary border-primary/25',
  tool: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  domain: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  soft: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  other: 'bg-white/5 text-slate-300 border-white/10',
};

const CATEGORY_LABELS: Record<ResumeTag['category'], string> = {
  language: 'Language',
  framework: 'Framework',
  tool: 'Tool',
  domain: 'Domain',
  soft: 'Soft skill',
  other: 'Other',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface ResumeCardProps {
  email?: string;
  /** Existing tech-stack entries, so we can show which tags are already added. */
  currentSkills: string[];
  onAddSkills: (labels: string[]) => void;
}

export default function ResumeCard({ email, currentSkills, onAddSkills }: ResumeCardProps) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore from cache immediately, then refresh from the API if it's live.
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setResume(JSON.parse(cached));
      } catch {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    if (!email) {
      setStatus('idle');
      return;
    }

    fetch(`/api/user/resume?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.resume) {
          setResume(data.resume);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.resume));
        }
      })
      .catch(() => {
        /* No backend yet — the cached copy is what we've got. */
      })
      .finally(() => setStatus('idle'));
  }, [email]);

  const upload = useCallback(
    async (file: File) => {
      if (!email) {
        setError('Add your email in onboarding before uploading a resume.');
        return;
      }

      setStatus('uploading');
      setError(null);
      setWarning(null);

      try {
        const body = new FormData();
        body.append('file', file);
        body.append('email', email);

        const res = await fetch('/api/user/resume', { method: 'POST', body });
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error ?? 'Upload failed.');
          return;
        }

        setResume(data.resume);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data.resume));
        if (data.warning) setWarning(data.warning);
      } catch {
        setError('Could not reach the server. Is the dev server running?');
      } finally {
        setStatus('idle');
      }
    },
    [email]
  );

  const remove = useCallback(async () => {
    const key = resume?.fileKey;
    setResume(null);
    setWarning(null);
    setError(null);
    localStorage.removeItem(CACHE_KEY);

    if (!email) return;
    const params = new URLSearchParams({ email });
    if (key) params.set('key', key);
    try {
      await fetch(`/api/user/resume?${params.toString()}`, { method: 'DELETE' });
    } catch {
      /* Local state is already cleared; a stale file is not worth blocking on. */
    }
  }, [email, resume]);

  const skillSet = new Set(currentSkills.map((s) => s.toLowerCase()));
  const newTags = resume?.tags.filter((t) => !skillSet.has(t.label.toLowerCase())) ?? [];

  return (
    <section className="glass-panel rounded-2xl p-md">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h3 className="font-h3 text-h3 text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">description</span> Resume
        </h3>
        {resume && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {resume.url && (
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 text-white text-[12px] font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span> View
              </a>
            )}
            <button
              onClick={() => inputRef.current?.click()}
              className="glass-panel px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 text-white text-[12px] font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span> Replace
            </button>
            <button
              onClick={remove}
              aria-label="Remove resume"
              className="glass-panel px-2 py-1.5 rounded-lg hover:bg-error/20 hover:text-error transition-colors text-slate-400"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />

      <AnimatePresence mode="wait">
        {status === 'uploading' ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-primary/30 bg-primary/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
              progress_activity
            </span>
            <p className="text-[13px] text-on-surface-variant font-semibold">
              Reading your resume and pulling out skills…
            </p>
          </motion.div>
        ) : !resume ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) upload(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-white/15 bg-white/[0.02] hover:border-primary/40 hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
            <p className="text-[14px] text-on-surface font-bold">Upload your resume</p>
            <p className="text-[12px] text-on-surface-variant text-center max-w-sm">
              We&apos;ll read it with Google AI and turn it into skill tags for matching.
            </p>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1">
              PDF, TXT or MD · max 5 MB
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* File summary */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-primary">picture_as_pdf</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-on-surface truncate">{resume.fileName}</p>
                <p className="text-[11px] text-slate-500">
                  {formatSize(resume.fileSize)}
                  {resume.pageCount ? ` · ${resume.pageCount} page${resume.pageCount > 1 ? 's' : ''}` : ''}
                  {` · updated ${new Date(resume.updatedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {/* Extracted tags */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    {resume.tagSource === 'gemini' ? 'auto_awesome' : 'manage_search'}
                  </span>
                  {resume.tagSource === 'gemini' ? 'AI-extracted skills' : 'Keyword-matched skills'}
                  <span className="text-slate-600 normal-case tracking-normal font-medium">
                    ({resume.tags.length})
                  </span>
                </h4>
                {newTags.length > 0 && (
                  <button
                    onClick={() => onAddSkills(newTags.map((t) => t.label))}
                    className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/30 transition-all text-[11px] font-bold flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Add {newTags.length} to Tech Stack
                  </button>
                )}
              </div>

              {resume.tags.length === 0 ? (
                <p className="text-[12px] text-slate-500">
                  No skills found in that resume. Try a version with a skills section.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resume.tags.map((tag) => {
                    const alreadyAdded = skillSet.has(tag.label.toLowerCase());
                    return (
                      <span
                        key={tag.label}
                        title={`${CATEGORY_LABELS[tag.category]} · ${Math.round(tag.confidence * 100)}% confidence`}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all ${CATEGORY_STYLES[tag.category] ?? CATEGORY_STYLES.other}`}
                      >
                        {alreadyAdded && (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        )}
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notices */}
      {error && (
        <div className="mt-4 flex items-start gap-2 bg-error/10 border border-error/20 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-error text-[18px] mt-px">error</span>
          <p className="text-[12px] text-error flex-1">{error}</p>
        </div>
      )}

      {warning && (
        <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-amber-400 text-[18px] mt-px">info</span>
          <p className="text-[12px] text-amber-200/90 flex-1">{warning}</p>
        </div>
      )}
    </section>
  );
}
