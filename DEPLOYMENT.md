# Deployment Guide

## Environment Variables Setup

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`:
   - **Supabase**: Get URL and keys from [Supabase Dashboard](https://supabase.com/dashboard)
   - **Alchemy**: Get API key from [Alchemy Dashboard](https://dashboard.alchemyapi.io)
   - **WalletConnect**: Get Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com)

### GitHub Pages Deployment

1. Go to your GitHub repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Add the following secrets:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
   ```

4. Enable GitHub Pages in repository settings:
   - Go to **Settings** → **Pages**
   - Source: **GitHub Actions**

## Deployment Commands

### Static Site Build (for GitHub Pages)
```bash
npm run build:static
```

### Regular Build (for server deployment)
```bash
npm run build
```

## Supported Networks

- Ethereum Mainnet
- Polygon
- Arbitrum One
- Arbitrum Sepolia (Testnet)
- Optimism
- Base

## Important Notes

⚠️ **For static deployments**: The API routes won't work. You'll need to deploy the API separately or use external services.

✅ **Client-side features that work in static deployment**:
- Wallet connections
- Blockchain interactions
- Web3 functionality
- Static content

🔒 **Security**: Never commit your actual `.env.local` file. Only commit `.env.example`.