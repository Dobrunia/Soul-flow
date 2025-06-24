import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Публичные маршруты (доступны без авторизации)
const publicRoutes = ['/', '/login', '/register'];

// Защищенные маршруты (требуют авторизации)
const protectedRoutes = ['/dashboard'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Создаем Supabase клиент прямо здесь
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Если маршрут публичный - пропускаем
  if (publicRoutes.includes(pathname)) {
    // Если авторизован и пытается зайти на auth страницы или главную - редирект на dashboard
    if (user && ['/login', '/register', '/'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return res;
  }

  // Если не авторизован и пытается зайти на защищенную страницу
  if (!user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Если авторизован и на защищенной странице - добавляем данные пользователя в headers
  if (user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    res.headers.set('x-user-id', user.id);
    res.headers.set('x-user-email', user.email || '');
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
