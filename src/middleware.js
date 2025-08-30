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
  
  // Create response object
  const response = NextResponse.next();
  
  // CRITICAL: Add headers to prevent caching of protected pages
  // This ensures browser doesn't cache pages and serve stale content from history
  if (!isPublicRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Accel-Expires', '0'); // For Nginx proxies
  }

  // If user is NOT authenticated
  if (!isAuthenticated) {
    // Allow access only to public routes
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      
      // Also set no-cache headers on redirect to prevent caching of redirect
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      redirectResponse.headers.set('Pragma', 'no-cache');
      return redirectResponse;
    }
  }
  
  // If user IS authenticated and trying to access login page, redirect to dashboard
  if (isAuthenticated && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    
    // Set no-cache headers on this redirect as well
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    redirectResponse.headers.set('Pragma', 'no-cache');
    return redirectResponse;
  }
  
  return response;
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
