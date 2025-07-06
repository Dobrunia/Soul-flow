import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // multiTab больше не нужен в v2
    },
    realtime: {
      reconnectAfterMs: (attempt: number) => Math.min(attempt * 500, 10_000),
      // другие опции при желании:
      // params: { eventsPerSecond: 10 },
    },
    cookieOptions: {
      path: '/', // ← исправлено на корневой путь
      sameSite: 'lax',
    },
  }
);
