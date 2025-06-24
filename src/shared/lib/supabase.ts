import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

// Единственный клиент для всех клиентских компонентов (авторизация, регистрация, логаут)
export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookies = document.cookie
            .split(';')
            .map((cookie) => {
              const [name, ...rest] = cookie.trim().split('=');
              const value = rest.join('=');
              return { name, value };
            })
            .filter((cookie) => cookie.name && cookie.value);

          console.log('Получаем cookies:', cookies);
          return cookies;
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          console.log('Устанавливаем cookies:', cookiesToSet);
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}; path=/`;
            if (options?.maxAge) {
              cookieString += `; max-age=${options.maxAge}`;
            }
            if (options?.sameSite) {
              cookieString += `; samesite=${options.sameSite}`;
            }
            if (options?.secure) {
              cookieString += `; secure`;
            }
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}
