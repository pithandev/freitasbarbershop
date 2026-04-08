import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Always use real values in browser - even if undefined, the client will handle it
  return createBrowserClient(
    supabaseUrl || 'https://emrjanuxmmgctjhctaty.supabase.co',
    supabaseKey || 'sb_publishable_EhILy3hsiRItmhZpXPiHKg_YWE1JPIC'
  );
}