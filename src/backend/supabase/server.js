import { createServerClient } from '@supabase/ssr';

export function createClient(context) {
  // If invoked with req & res from Pages Router API / getServerSideProps
  if (context && context.req && context.res) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return Object.keys(context.req.cookies || {}).map((name) => ({
              name,
              value: context.req.cookies[name]
            }));
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                context.res.setHeader(
                  'Set-Cookie',
                  `${name}=${encodeURIComponent(value)}; Path=${options?.path || '/'}`
                );
              });
            } catch (e) {}
          }
        }
      }
    );
  }

  // App Router (next/headers) fallback
  let cookiesStore;
  try {
    const { cookies } = require('next/headers');
    cookiesStore = cookies();
  } catch (e) {}

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          if (!cookiesStore) return [];
          return cookiesStore.getAll();
        },
        setAll(cookiesToSet) {
          if (!cookiesStore) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookiesStore.set(name, value, options)
            );
          } catch (error) {}
        }
      }
    }
  );
}
