import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Exclude auth callback routes from middleware processing entirely
const CALLBACK_ROUTES = [
  '/auth/callback',
  '/auth/google/callback',
  '/auth/facebook/callback',
  '/auth/verify-email',
  '/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth callback routes to prevent redirect loops
  if (CALLBACK_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protected and auth route decisions are handled by client-side guards.
  // The client-side AuthProvider always has the authoritative session state
  // after hydration. Middleware should NOT redirect before session validation
  // completes, as this causes post-login bounce loops when session cookies
  // haven't propagated yet after OAuth callback redirect.
  //
  // Server-side redirect would race with:
  //   1. Supabase PKCE session establishment (async)
  //   2. Zustand persist rehydration
  //   3. AuthProvider initialization
  //
  // All auth enforcement happens client-side via requireAuth() and route guards.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
