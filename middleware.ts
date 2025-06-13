import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || 'xwayp-admin-2024';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect admin routes
  if (path.startsWith('/admin')) {
    const auth = request.cookies.get('admin-auth');
    
    // Check if authenticated
    if (!auth || auth.value !== 'authenticated') {
      return NextResponse.redirect(new URL(`/${ADMIN_SECRET_PATH}`, request.url));
    }
  }
  
  // Block directory enumeration attempts
  const blockedPaths = [
    '/.git',
    '/.env',
    '/wp-admin',
    '/wp-content',
    '/wordpress',
    '/.well-known',
    '/phpmyadmin',
    '/config',
    '/backup',
    '/api/config',
  ];
  
  if (blockedPaths.some(blocked => path.startsWith(blocked))) {
    // Return infinite redirect loop
    return NextResponse.redirect(new URL(path + '/redirect', request.url));
  }
  
  // Block common scanner paths
  if (path.match(/\.(php|asp|aspx|jsp|cgi|pl|py|rb|sh|bat|exe|dll|sql|bak|old|log|config|ini|yaml|yml|toml|xml|json)$/i)) {
    return new NextResponse(null, { status: 404 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)',
  ],
};