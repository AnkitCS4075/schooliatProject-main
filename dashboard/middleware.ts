import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);

  // Check for token in cookies or sessionStorage (client-side)
  // For server-side, we'll check in the layout/component
  const token = request.cookies.get("accessToken")?.value;

  // If accessing a protected route without a token, redirect to login
  if (!isPublicRoute && !token) {
    // Note: We can't access sessionStorage from middleware
    // So we'll do the actual check in the client-side layout
    // This middleware is mainly for cookie-based auth if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

