import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Read the `type` claim of a JWT without verifying it (edge gate only). */
function tokenType(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const payload = raw.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return (JSON.parse(json) as { type?: string }).type ?? null;
  } catch {
    return null;
  }
}

/**
 * Stealth gate for /admin/*:
 * - Lets requests through with the ADMIN session cookie, or with a legacy
 *   pre-split admin JWT (so nobody gets locked out by the session split).
 * - Everyone else gets rewritten to a path that matches nothing, so Next
 *   renders the root 404 page. The secret login at /mjm is never linked
 *   or redirected-to from here.
 * Real enforcement lives in the API (JWT guard) + AdminGuard (role check).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (request.cookies.get('mjm_admin_token')) {
      return NextResponse.next();
    }
    if (tokenType(request.cookies.get('mjm_token')?.value) === 'admin') {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL('/__no_such_page__', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
