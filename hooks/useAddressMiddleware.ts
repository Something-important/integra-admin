import { useEffect } from 'react';
import { useAccount } from 'wagmi';

/**
 * Hook to manage wallet address for middleware authentication
 * Sets the wallet address in a cookie that the middleware can read
 */
export const useAddressMiddleware = () => {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      // Set the wallet address in a cookie that middleware can read
      document.cookie = `wallet-address=${address}; path=/; max-age=86400; SameSite=Strict`;
    } else {
      // Clear the cookie if wallet is disconnected
      document.cookie = 'wallet-address=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [address, isConnected]);

  return { address, isConnected };
};