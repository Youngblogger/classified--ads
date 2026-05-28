import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/ad/edit',
  '/promote',
];

const AUTH_ROUTES = [
  '/auth/register',
  '/auth/login',
  '/auth/verify',
];

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const hasSupabaseConfig = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co';
  let hasSession = false;

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
    hasSession = !!session;
  }

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
