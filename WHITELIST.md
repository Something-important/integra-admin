# Address Whitelist Configuration

This admin panel implements address-based access control using Next.js middleware. Only whitelisted Ethereum addresses can access protected routes.

## How It Works

1. **Middleware Authentication**: The `middleware.ts` file intercepts requests and checks if the user's wallet address is whitelisted
2. **Cookie-based Address Tracking**: The user's wallet address is stored in a cookie when they connect their wallet
3. **Route Protection**: Specific routes require whitelisted addresses to access
4. **Access Denied Page**: Non-whitelisted users are redirected to `/access-denied` with appropriate messaging

## Configuration

### Adding/Removing Whitelisted Addresses

Edit the `config/whitelist.ts` file:

```typescript
export const WHITELIST_CONFIG = {
  WHITELISTED_ADDRESSES: [
    '0x742d35cc6cf6c6e5cb3e63e7b3a7e3c4e4b4f3e7', // Example address 1
    '0x1234567890123456789012345678901234567890', // Example address 2
    // Add more addresses here (lowercase)
  ],
  // ...
};
```

**Important**:
- Addresses should be in lowercase format
- Include the full address with '0x' prefix
- Remove the comments when adding real addresses

### Configuring Protected Routes

Edit the `PROTECTED_ROUTES` array in `config/whitelist.ts`:

```typescript
PROTECTED_ROUTES: [
  '/dashboard',
  '/marketplace',
  '/profile',
  // Add more routes that require whitelisting
],
```

### Configuring Public Routes

Edit the `PUBLIC_ROUTES` array in `config/whitelist.ts`:

```typescript
PUBLIC_ROUTES: [
  '/',
  '/access-denied',
  // Add more routes that should always be accessible
],
```

## Testing the Whitelist

1. **Test with Whitelisted Address**:
   - Connect a whitelisted wallet
   - Navigate to protected routes (should work normally)

2. **Test with Non-Whitelisted Address**:
   - Connect a non-whitelisted wallet
   - Navigate to protected routes (should redirect to access denied page)

3. **Test without Wallet**:
   - Disconnect wallet
   - Navigate to protected routes (should redirect to access denied page)

## File Structure

```
/
├── middleware.ts                 # Main middleware logic
├── config/whitelist.ts          # Whitelist configuration
├── hooks/useAddressMiddleware.ts # Hook for setting wallet address in cookies
├── app/access-denied/page.tsx   # Access denied page
└── WHITELIST.md                 # This documentation
```

## Security Considerations

1. **Address Verification**: Addresses are checked on every request to protected routes
2. **Cookie Security**: Wallet addresses are stored in secure, same-site cookies
3. **Client-Side Bypass Prevention**: Middleware runs on the server, preventing client-side bypasses
4. **Route Protection**: Both exact matches and path prefixes are supported for route protection

## Troubleshooting

### Common Issues

1. **User still has access after removing from whitelist**:
   - Clear browser cookies or wait for cookie expiration
   - Restart the Next.js development server

2. **Middleware not running**:
   - Check that `middleware.ts` is in the root directory
   - Verify the `config.matcher` in middleware.ts

3. **Routes not being protected**:
   - Verify route paths in `PROTECTED_ROUTES` configuration
   - Check that routes start with the correct prefix

### Debug Mode

To debug middleware behavior, add console.logs in `middleware.ts`:

```typescript
export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname);
  console.log('Connected address:', request.cookies.get('wallet-address')?.value);
  // ... rest of middleware
}
```

## Deployment Notes

1. **Environment Variables**: Consider moving the whitelist to environment variables for production
2. **Database Integration**: For larger systems, consider storing the whitelist in a database
3. **Audit Logging**: Add logging for access attempts and denials
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Future Enhancements

- [ ] Role-based access control (admin, user, etc.)
- [ ] Time-based access (temporary whitelist entries)
- [ ] API endpoint for managing whitelist
- [ ] Integration with external identity providers
- [ ] Audit trail for access attempts