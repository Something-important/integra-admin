# 🏗️ Integra Admin Panel

<h4 align="center">
  <a href="#features">Features</a> |
  <a href="#quickstart">Quickstart</a> |
  <a href="#security">Security</a> |
  <a href="#usage">Usage Guide</a>
</h4>

🚀 An administrative dashboard for the Integra tokenized real estate platform. This secure admin panel enables authorized administrators to manage users, assets, and platform operations with comprehensive whitelist-based access control.

⚙️ Built using NextJS, RainbowKit, Wagmi, Viem, and Typescript with advanced middleware-based security.

## Features

### 🏠 **Admin Dashboard Homepage**
- **Portfolio Overview**: View total investments, current value, ROI, and monthly income across all properties
- **Performance Tracking**: Monitor platform-wide statistics and key metrics
- **Quick Navigation**: Access all admin functions from a centralized hub
- **Real Estate Insights**: Track property performance and investment trends

### 👥 **User Management**
- **Add Users**: Onboard new users to the platform with proper verification
- **Delete Users**: Remove unauthorized or inactive user accounts
- **Approve Users**: Review and approve pending user registrations
- **User Analytics**: Track user activity, investment patterns, and engagement metrics
- **Whitelist Control**: Manage wallet address whitelisting for platform access

### 🏢 **Asset Management**
- **Add Properties**: List new tokenized real estate assets with detailed information
- **Delete Assets**: Remove properties from the marketplace
- **Approve Listings**: Review and approve property submissions from verified sellers
- **Asset Analytics**: Monitor property performance, shares distribution, and revenue
- **Portfolio Management**: Oversee the entire real estate portfolio and tokenization status

### 🔐 **Security & Access Control**
- **Wallet-Based Authentication**: Secure login using Web3 wallet connections
- **Address Whitelisting**: Middleware-enforced access control for authorized administrators only
- **Route Protection**: Secure all admin functions behind authentication barriers
- **Access Denied Handling**: Professional error pages for unauthorized access attempts

### 💎 **Web3 Integration**
- **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, and other providers via RainbowKit
- **Address Display**: Professional wallet address components with copy functionality
- **Balance Tracking**: Real-time ETH and token balance monitoring
- **Transaction Management**: Handle blockchain transactions for asset tokenization

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Project Structure

```
integra-admin/
├── app/
│   ├── page.tsx                  # Admin homepage with portfolio overview
│   ├── dashboard/
│   │   └── page.tsx             # Investment dashboard and analytics
│   ├── marketplace/
│   │   ├── page.tsx             # Property marketplace management
│   │   └── [id]/page.tsx        # Individual property details
│   ├── profile/
│   │   └── page.tsx             # Admin profile management
│   ├── access-denied/
│   │   └── page.tsx             # Access denied page for unauthorized users
│   └── layout.tsx               # Root layout with providers
├── components/
│   ├── Header.tsx               # Navigation with admin-specific links
│   ├── Footer.tsx               # Footer component
│   └── scaffold-eth/            # Web3 UI components
├── config/
│   └── whitelist.ts             # Whitelist configuration and utilities
├── hooks/
│   ├── useAddressMiddleware.ts  # Wallet address middleware hook
│   └── scaffold-eth/            # Scaffold-ETH custom hooks
├── middleware.ts                # Next.js middleware for access control
├── services/
│   └── web3/                    # Web3 configuration and providers
└── utils/
    └── scaffold-eth/            # Utility functions and helpers
```

## Security Features

This admin panel implements comprehensive security measures:

### 🔒 **Address Whitelisting**
- **Server-Side Middleware**: Routes are protected at the middleware level, preventing client-side bypasses
- **Cookie-Based Authentication**: Wallet addresses are securely stored in httpOnly cookies
- **Real-Time Verification**: Each request verifies the connected wallet against the whitelist
- **Configurable Routes**: Easy configuration of protected vs. public routes

### 🛡️ **Access Control**
- **Route Protection**: `/dashboard`, `/marketplace`, and `/profile` require whitelisted addresses
- **Graceful Denial**: Non-whitelisted users see informative access denied pages
- **Wallet Connection Required**: All protected features require an active wallet connection
- **Automatic Redirects**: Unauthorized access attempts are automatically redirected

### ⚙️ **Configuration Management**
- **Centralized Whitelist**: All whitelisted addresses managed in `config/whitelist.ts`
- **Easy Updates**: Add/remove addresses without code deployment
- **Route Configuration**: Flexible configuration of protected and public routes
- **Documentation**: Comprehensive documentation for security management

## Quickstart

To get started with the Integra Admin Panel, follow the steps below:

1. **Clone and Install Dependencies**:

```bash
cd integra-admin
npm install
```

2. **Configure Whitelist** (Important for Security):

Edit `config/whitelist.ts` and add your admin wallet addresses:

```typescript
WHITELISTED_ADDRESSES: [
  '0xYourAdminAddress1',
  '0xYourAdminAddress2',
  // Add more admin addresses
],
```

3. **Start the Development Server**:

```bash
npm run dev
```

4. **Access the Admin Panel**:

Visit: `http://localhost:3000`

- Connect your whitelisted wallet to access admin features
- Non-whitelisted addresses will see an access denied page
- Navigate between Dashboard, Marketplace, and Profile sections

## Important Setup Notes

⚠️ **Security First**: The admin panel is protected by address whitelisting. Make sure to:
1. Add your wallet address to the whitelist before testing
2. Test with both whitelisted and non-whitelisted addresses
3. Review the security documentation in `WHITELIST.md`


## Admin Panel Usage

### 🏠 **Admin Homepage**
The main dashboard provides a comprehensive overview of the real estate platform:

- **Portfolio Statistics**: View total investments, current value, ROI, and monthly income
- **Performance Metrics**: Monitor platform-wide key performance indicators
- **Quick Access**: Navigate to user management, asset management, and profile settings
- **Real Estate Insights**: Track property performance and investment trends
- **Navigation Hub**: Access all admin functions from the centralized dashboard

### 👥 **User Management**
Comprehensive user administration capabilities:

- **Add New Users**:
  - Onboard new users with wallet address verification
  - Set user permissions and access levels
  - Validate user identity and KYC requirements

- **Approve Pending Users**:
  - Review user registration requests
  - Verify submitted documentation and credentials
  - Approve or reject user applications with detailed feedback

- **Delete/Suspend Users**:
  - Remove unauthorized or violating user accounts
  - Temporary suspension for policy violations
  - Maintain audit trail of user management actions

- **User Analytics**:
  - Track user investment patterns and portfolio performance
  - Monitor user engagement and platform activity
  - Generate reports on user demographics and behavior

### 🏢 **Asset Management**
Complete real estate asset administration:

- **Add New Properties**:
  - List tokenized real estate assets with comprehensive details
  - Set tokenization parameters (total shares, price per share)
  - Upload property documentation, images, and legal documents
  - Configure smart contracts for property tokenization

- **Approve Property Listings**:
  - Review submitted property applications from verified sellers
  - Validate property documentation and legal compliance
  - Approve or reject listings with detailed feedback
  - Set property visibility and availability status

- **Manage Existing Assets**:
  - Edit property information and pricing
  - Remove properties from the marketplace
  - Track property performance and share distribution
  - Monitor rental income and property appreciation

- **Asset Analytics**:
  - View property-specific performance metrics
  - Track tokenization progress and share sales
  - Monitor rental yields and property appreciation
  - Generate comprehensive asset performance reports

### 🔧 **Development & Integration Notes**
- **Mock Data**: Currently uses demonstration data for testing purposes
- **Smart Contract Integration**: Ready for blockchain deployment with Web3 providers
- **Scalable Architecture**: Built with production-ready patterns and security measures
- **API Ready**: Structured for backend API integration and data persistence
- **Responsive Design**: Optimized for desktop and mobile admin workflows

## Whitelist Management

### Adding Admin Addresses

To grant admin access to new wallet addresses:

1. **Edit the Configuration**:
   ```typescript
   // config/whitelist.ts
   WHITELISTED_ADDRESSES: [
     '0xYourExistingAdmin',
     '0xNewAdminAddress', // Add new admin here
   ]
   ```

2. **Verify Access**:
   - New admin connects their wallet
   - They can now access all protected routes
   - Non-whitelisted users will see access denied page

### Route Configuration

Configure which routes require admin access:

```typescript
// config/whitelist.ts
PROTECTED_ROUTES: [
  '/dashboard',    // Investment analytics
  '/marketplace',  // Property management
  '/profile',      // Admin profile
  // Add more protected routes as needed
]
```

### Security Best Practices

- **Regular Audits**: Periodically review the whitelist for unauthorized addresses
- **Principle of Least Privilege**: Only add addresses that require admin access
- **Access Monitoring**: Monitor access attempts and unauthorized requests
- **Address Verification**: Verify wallet ownership before adding to whitelist
- **Documentation**: Maintain records of who has admin access and why

For detailed security documentation, see `WHITELIST.md`.

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier
```

## Built With Scaffold-ETH 2

This admin panel leverages the power of Scaffold-ETH 2 framework, providing:

- **Web3 Components**: Ready-to-use components for blockchain interactions
- **Wallet Integration**: Seamless wallet connection via RainbowKit
- **Type Safety**: Full TypeScript support for smart contracts
- **Development Tools**: Hot reload, debugging, and testing utilities

Visit the [Scaffold-ETH docs](https://docs.scaffoldeth.io) to learn more about the underlying technology stack.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/admin-enhancement`)
3. Commit your changes (`git commit -m 'Add admin enhancement'`)
4. Push to the branch (`git push origin feature/admin-enhancement`)
5. Open a Pull Request

## License

This project is part of the Integra real estate tokenization platform. See LICENSE for details.