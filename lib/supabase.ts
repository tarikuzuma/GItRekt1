import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client used only for Realtime (match + chat broadcasts).
 *
 * `createClient` throws if the URL is missing, and this module is pulled in by
 * AppLayout — which every page renders — so constructing it eagerly took the
 * whole app down whenever the env vars were blank. It's now built lazily, and
 * falls back to a no-op stub when unconfigured: realtime pushes silently do
 * nothing instead of crashing the page. Everything else runs through Prisma.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/** Mimics the chainable channel API surface the app actually uses. */
function createStubClient() {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    send: async () => 'ok',
    unsubscribe: async () => 'ok',
  };

  return {
    channel: () => channel,
    removeChannel: async () => 'ok',
  };
}

let instance: unknown;

function getClient(): unknown {
  if (!instance) {
    if (isSupabaseConfigured) {
      instance = createClient(url!, anonKey!);
    } else {
      console.warn(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY are not set — ' +
          'realtime is disabled. Live match and chat updates will not push.'
      );
      instance = createStubClient();
    }
  }
  return instance;
}

/**
 * Same import shape as before (`import { supabase } from '@/lib/supabase'`),
 * but nothing is constructed until a property is actually touched.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient() as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
