import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  // Let auth0 handle its own routes (/auth/login, /auth/callback, etc.)
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return authRes;
  }

  // For protected routes, check if user is logged in
  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return authRes;
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/:path*'],
};
