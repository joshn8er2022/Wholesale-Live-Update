
# Shopify Inventory Dashboard

A real-time inventory tracking dashboard for Shopify stores built with Next.js.

## Features

- Real-time inventory monitoring
- Visual stock level indicators
- Product variant support
- Automatic refresh functionality
- Clean, professional dashboard design

## Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```bash
   cd app
   yarn install
   ```

3. Set up environment variables:
   - Copy `app/.env.example` to `app/.env`
   - Fill in your Shopify store credentials:
     ```
     SHOPIFY_STORE_URL=your-store.myshopify.com
     SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here
     NEXT_PUBLIC_API_URL=http://localhost:3000
     ```

4. Run the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

## Getting Shopify API Credentials

1. Go to your Shopify Admin Panel
2. Navigate to `Settings > Apps and sales channels > Develop apps`
3. Click "Create an app"
4. Configure Admin API access with these permissions:
   - `read_products`
   - `read_inventory`
5. Get your Store URL and Admin API Access Token from the app settings

## Environment Variables

- `SHOPIFY_STORE_URL`: Your Shopify store URL
- `SHOPIFY_ACCESS_TOKEN`: Admin API access token from your Shopify store
- `NEXT_PUBLIC_API_URL`: API URL for the application

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Shopify Admin API
