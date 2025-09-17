import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log('Middleware - Path:', pathname, 'Token exists:', !!token);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/signin', '/signup', '/pricing'];
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/upload', '/settings'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // If it's a protected route and user is not authenticated, redirect to signin
  if (isProtectedRoute && !token) {
    console.log('Middleware - Redirecting to signin - no token found for protected route:', pathname);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};