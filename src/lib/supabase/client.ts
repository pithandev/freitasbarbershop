// Browser client - only runs on client side

const isBuildTime = typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes('placeholder')) {
    return 'https://placeholder.supabase.co';
  }
  return url;
}

function getSupabaseKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key || key.includes('placeholder')) {
    return 'placeholder-key';
  }
  return key;
}

let _client: any = null;

export function createClient() {
  if (isBuildTime) {
    // During SSR/build, return mock
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }) }) }),
      auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
    };
  }

  if (!_client) {
    const { createBrowserClient } = require('@supabase/ssr');
    _client = createBrowserClient(getSupabaseUrl(), getSupabaseKey());
  }
  
  return _client;
}