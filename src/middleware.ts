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

// Exclude auth callback routes from middleware processing entirely
const CALLBACK_ROUTES = [
  '/auth/callback',
  '/auth/google/callback',
  '/auth/facebook/callback',
  '/auth/verify-email',
  '/auth/reset-password',
];

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/', request.url);
  // Attach the intended destination as a query param so the client
  // can restore the redirect after login (as a backup to localStorage).
  loginUrl.searchParams.set('login_redirect', request.nextUrl.pathname);
  loginUrl.searchParams.set('login', 'required');
  return NextResponse.redirect(loginUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth callback routes to prevent redirect loops
  if (CALLBACK_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const hasSupabaseConfig = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co';
  let hasSession = false;

  if (hasSupabaseConfig) {
    try {
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
        auth: {
          storageKey: 'ilist-supabase-auth',
          flowType: 'pkce',
        },
      });

      const { data: { session } } = await supabaseClient.auth.getSession();
      hasSession = !!session;

      // Fallback: check custom auth cookie (set by callback pages after OAuth)
      if (!hasSession) {
        const customToken = request.cookies.get('ilist-supabase-auth-token');
        hasSession = !!customToken?.value;
      }
    } catch (e) {
      console.error('[Middleware] Session check failed:', e);
    }
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
