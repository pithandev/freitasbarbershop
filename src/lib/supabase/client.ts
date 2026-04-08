import { createBrowserClient } from '@supabase/ssr';

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
}

function getSupabaseKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
}

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseKey()
  );
}