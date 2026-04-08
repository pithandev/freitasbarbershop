// This module is intentionally NOT importing from @supabase/ssr during static generation
// to prevent build failures when env vars are missing

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

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

// Lazy client that only initializes when actually needed
let _client: any = null;

export async function createClient() {
  if (isBuildTime) {
    // During build, return a mock that won't fail
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }), order: () => ({ data: [], error: null }) }) }) }),
      auth: { getUser: () => Promise.resolve({ data: { user: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
    };
  }

  // Runtime: create real client
  if (!_client) {
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    _client = createServerClient(
      getSupabaseUrl(),
      getSupabaseKey(),
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
          },
        },
      }
    );
  }
  
  return _client;
}