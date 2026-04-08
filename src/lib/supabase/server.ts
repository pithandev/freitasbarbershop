// @ts-nocheck

const REAL_SUPABASE_URL = 'https://emrjanuxmmgctjhctaty.supabase.co';
const REAL_SUPABASE_KEY = 'sb_publishable_EhILy3hsiRItmhZpXPiHKg_YWE1JPIC';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || REAL_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || REAL_SUPABASE_KEY;

  // During build time with placeholder values, return stub
  if (supabaseUrl.includes('placeholder')) {
    return {
      from: () => ({ 
        select: () => ({ 
          eq: () => ({ 
            single: () => Promise.resolve({ data: null, error: null }), 
            order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) 
          }),
          order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
        }) 
      }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      auth: { 
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
      }
    };
  }

  // Runtime: real client
  const { createServerClient } = await import('@supabase/ssr');
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}