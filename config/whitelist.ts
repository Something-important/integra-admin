// Whitelist configuration for the admin panel
export const WHITELIST_CONFIG = {
  // Whitelist of allowed Ethereum addresses (lowercase for comparison)
  WHITELISTED_ADDRESSES: [
    '0xAD95fBF311a6EE0221a4BaDe4ae7DEfd8cE98eBb', // Example address 1
    '0x1234567890123456789012345678901234567890', // Example address 2
    // Add more addresses as needed
  ],

  // Routes that require whitelisting (add or remove as needed)
  PROTECTED_ROUTES: [
    '/users',
    '/listing',
    '/profile',
    '/tokenize',
    // Add more protected routes as needed
  ],

  // Public routes that are always accessible
  PUBLIC_ROUTES: [
    '/',
    '/access-denied',
    // Add more public routes as needed
  ],
};

/**
 * Check if an address is whitelisted
 */
export const isAddressWhitelisted = (address: string): boolean => {
  return WHITELIST_CONFIG.WHITELISTED_ADDRESSES.includes(address.toLowerCase());
};

/**
 * Check if a route is protected
 */
export const isRouteProtected = (pathname: string): boolean => {
  return WHITELIST_CONFIG.PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

/**
 * Check if a route is public
 */
export const isRoutePublic = (pathname: string): boolean => {
  return WHITELIST_CONFIG.PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
};