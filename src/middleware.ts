import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/post-ad',
  '/ad/edit',
  '/promote',
];

const AUTH_ROUTES = [
  '/auth/register',
  '/auth/login',
  '/auth/verify',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  const hasSupabaseConfig = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co';

  if (hasSupabaseConfig) {
    const supabaseAuthCookie = request.cookies.get('ilist-supabase-auth')?.value;
    const hasSession = !!supabaseAuthCookie;

    if (isProtected && !hasSession) {
      const legacyToken = request.cookies.get('token')?.value;
      const userAuthStorage = request.cookies.get('user-auth-storage')?.value;

      if (!legacyToken && !userAuthStorage) {
        if (pathname.startsWith('/dashboard')) {
          const loginUrl = new URL('/', request.url);
          loginUrl.searchParams.set('login', 'required');
          return NextResponse.redirect(loginUrl);
        }
        if (pathname.startsWith('/post-ad') || pathname.startsWith('/ad/edit') || pathname.startsWith('/promote')) {
          const loginUrl = new URL('/', request.url);
          loginUrl.searchParams.set('login', 'required');
          return NextResponse.redirect(loginUrl);
        }
      }
    }

    if (isAuthRoute && hasSession) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    const legacyToken = request.cookies.get('token')?.value;
    const userAuthStorage = request.cookies.get('user-auth-storage')?.value;
    const hasLegacySession = !!legacyToken || !!userAuthStorage;

    if (isProtected && !hasLegacySession) {
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/post-ad') || pathname.startsWith('/ad/edit') || pathname.startsWith('/promote')) {
        const loginUrl = new URL('/', request.url);
        loginUrl.searchParams.set('login', 'required');
        return NextResponse.redirect(loginUrl);
      }
    }

    if (isAuthRoute && hasLegacySession) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
