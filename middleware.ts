import { NextRequest, NextResponse } from 'next/server';

// Inline the whitelist configuration to avoid import issues
const WHITELISTED_ADDRESSES = [
  '0xad95fbf311a6ee0221a4bade4ae7defd8ce98ebb', // Example address 1 (lowercase)
  '0x1234567890123456789012345678901234567890', // Example address 2
  // Add more addresses as needed
];

const PROTECTED_ROUTES = [
  '/users',
  '/marketplace',
  '/profile',
];

// Debug: log the exact routes being checked
console.log('[MIDDLEWARE] Protected routes configured:', PROTECTED_ROUTES);

const PUBLIC_ROUTES = [
  '/',
  '/access-denied',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`[MIDDLEWARE] Processing: ${pathname}`);

  // Always allow access to public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
    console.log(`[MIDDLEWARE] Public route allowed: ${pathname}`);
    return NextResponse.next();
  }

  // Check if the current route needs protection
  const isProtected = PROTECTED_ROUTES.some(route => {
    const matches = pathname.startsWith(route);
    console.log(`[MIDDLEWARE] Checking route "${route}" against "${pathname}": ${matches}`);
    return matches;
  });

  if (!isProtected) {
    console.log(`[MIDDLEWARE] Non-protected route allowed: ${pathname}`);
    return NextResponse.next();
  }

  console.log(`[MIDDLEWARE] Protected route detected: ${pathname}`);

  // Get the connected address from cookies
  const connectedAddress = request.cookies.get('wallet-address')?.value;
  console.log(`[MIDDLEWARE] Connected address: ${connectedAddress || 'None'}`);

  if (!connectedAddress) {
    // No wallet connected, redirect to access denied page
    console.log(`[MIDDLEWARE] No wallet - redirecting to access denied`);
    const url = new URL('/access-denied', request.url);
    url.searchParams.set('reason', 'no-wallet');
    return NextResponse.redirect(url);
  }

  // Check if the address is whitelisted (case insensitive)
  if (!WHITELISTED_ADDRESSES.includes(connectedAddress.toLowerCase())) {
    // Address not whitelisted, redirect to access denied page
    console.log(`[MIDDLEWARE] Address not whitelisted - redirecting: ${connectedAddress}`);
    const url = new URL('/access-denied', request.url);
    url.searchParams.set('reason', 'not-whitelisted');
    return NextResponse.redirect(url);
  }

  console.log(`[MIDDLEWARE] Address whitelisted - allowing access: ${connectedAddress}`);
  // Address is whitelisted, allow access
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};