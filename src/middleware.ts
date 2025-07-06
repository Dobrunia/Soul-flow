import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareSupabase } from '@/shared/lib/supabase/middleware';
import { homePage } from '@/shared/variables/home.page';

const publicRoutes = ['/', '/login', '/register'];
const protectedRoutes = [homePage];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createMiddlewareSupabase(request, response);

  /* ← безопасно проверяем токен */
  const {
    data: { user },
  } = await supabase.auth.getUser(); // именно getUser()

  const { pathname } = request.nextUrl;

  /* ---------- публичные ---------- */
  if (publicRoutes.includes(pathname)) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = homePage; // авторизован? → внутрь приложения
      return NextResponse.redirect(url);
    }
    return response; // не залогинен → пропускаем
  }

  /* ---------- защищённые ---------- */
  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url); // гостя отправляем на /login
  }

  if (user && isProtected) {
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email ?? '');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
