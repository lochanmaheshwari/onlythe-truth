import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zmnecxlcwxyiqyoobzxu.supabase.co';

let client: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables');
    }
    client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return client;
}

// Lazy proxy so importing this module never crashes a build that lacks the
// service-role key; the key is only required when a query actually runs.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getSupabaseAdmin() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});
