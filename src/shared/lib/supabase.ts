import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

// Упрощенный браузерный клиент - позволяем Supabase самому управлять cookies
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
