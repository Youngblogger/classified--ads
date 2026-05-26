import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/', request.url);
  loginUrl.searchParams.set('login', 'required');
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const hasSupabaseConfig = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co';

  let hasSupabaseSession = false;

  if (hasSupabaseConfig) {
    const supabaseClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
        },
      },
    });

    const { data: { session } } = await supabaseClient.auth.getSession();
    hasSupabaseSession = !!session;
  }

  const legacyToken = request.cookies.get('token')?.value;
  const userAuthStorage = request.cookies.get('user-auth-storage')?.value;
  const hasLegacySession = !!legacyToken || !!userAuthStorage;

  const hasSession = hasSupabaseSession || (hasSupabaseConfig ? false : hasLegacySession);

  if (isProtected && !hasSession) {
    return redirectToLogin(request);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
