
# Hume Health - Healthcare Logistics Platform

A comprehensive healthcare logistics platform built with Next.js that provides bulk purchase management, patient fulfillment tracking, and real-time analytics for healthcare organizations.

## Features

### 🏥 Admin Portal
- **Bulk Purchase Management**: Create, track, and manage wholesale healthcare purchases
- **Patient Link Generation**: Generate secure redemption links for patient fulfillment
- **Real-time Analytics**: Monitor redemption rates, fulfillment status, and inventory levels
- **Shopify Integration**: Sync with Shopify for inventory and order management

### 👥 Client Portal
- **Purchase Tracking**: View and manage your organization's bulk purchases
- **Patient Management**: Generate and distribute patient redemption links
- **Analytics Dashboard**: Track fulfillment rates and patient engagement
- **Secure Authentication**: Role-based access control with NextAuth

### 🔗 Patient Portal
- **Easy Redemption**: Simple link-based access for patients to claim their items
- **Order Tracking**: View redemption status and fulfillment details
- **Mobile Optimized**: Responsive design for mobile and desktop access

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: SQLite with Prisma ORM
- **API Integration**: Shopify Admin API
- **Charts & Analytics**: Recharts, Chart.js
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Shopify store with Admin API access
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joshn8er2022/Wholesale-Live-Update.git
   cd Wholesale-Live-Update
   ```

2. **Install dependencies**
   ```bash
   cd app
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your actual values:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secure-secret-key-here"
   
   # Shopify API Configuration
   SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
   SHOPIFY_ACCESS_TOKEN="your-shopify-admin-access-token"
   
   # AbacusAI API Configuration (optional)
   ABACUSAI_API_KEY="your-abacusai-api-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Shopify Setup

### Required Permissions
Your Shopify Private App needs these permissions:
- `read_products` - To fetch product information
- `read_orders` - To sync order data
- `read_inventory` - To track inventory levels

### Creating a Private App
1. Go to your Shopify Admin → Apps → App and sales channel settings
2. Click "Develop apps" → "Create an app"
3. Enable Admin API access with the required permissions
4. Copy your Admin API access token to `.env`

## Test Accounts

After seeding the database, use these accounts:

**Admin Account**
- Email: `admin@humehealth.com`
- Password: `admin123`

**Client Account**
- Email: `client@healthcare.org`
- Password: `client123`

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration

### Admin APIs
- `GET/POST /api/admin/bulk-purchases` - Manage bulk purchases
- `GET/POST /api/admin/patient-links` - Generate patient links
- `GET /api/admin/analytics` - View analytics data

### Client APIs
- `GET /api/client/bulk-purchases` - View client purchases
- `GET /api/client/analytics` - Client-specific analytics

### Patient APIs
- `GET /api/patient/[linkId]` - Access patient redemption page
- `POST /api/patient/redeem` - Complete item redemption

### Shopify Integration
- `POST /api/shopify/sync-orders` - Sync orders from Shopify
- `GET /api/shopify/products` - Fetch product catalog

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
```bash
yarn build
yarn start
```

## Database Schema

### Key Models
- **User**: Admin and client user accounts
- **BulkPurchase**: Wholesale purchase records
- **PatientLink**: Secure redemption links for patients
- **ProductScheme**: Product variations and pricing
- **Redemption**: Patient fulfillment tracking

## Security Features

- **Role-based Access**: Separate admin, client, and patient portals
- **Secure Authentication**: NextAuth with encrypted sessions
- **Link Expiration**: Time-limited patient redemption links
- **Input Validation**: Comprehensive form and API validation
- **Environment Secrets**: Secure credential management

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

For issues and questions:
- Create an issue on GitHub
- Check the [documentation](./docs/)
- Review the API endpoints in the code

## License

This project is proprietary software. All rights reserved.

---

Built with ❤️ for healthcare organizations using Next.js and modern web technologies.
