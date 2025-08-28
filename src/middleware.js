import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the authentication token from cookies
  const authToken = request.cookies.get('authToken');
  const isAuthenticated = authToken && authToken.value === 'authenticated';
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/', // login page
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If user is NOT authenticated
  if (!isAuthenticated) {
    // Allow access only to public routes
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }
  
  // If user IS authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
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
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
