import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabase() {
  const store = await cookies(); // доступно в RSC, API, actions

  /* … */
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(), // читает любые path
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach((c) => store.set(c.name, c.value, { ...c.options, path: '/' })),
      },
    }
  );
}
