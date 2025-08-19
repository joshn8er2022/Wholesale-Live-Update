# 🚀 Deploy to Railway - Step by Step

Your app is ready! Follow these steps to deploy:

## Step 1: Login to Railway
Open your terminal and run:
```bash
railway login
```
This will open your browser to authenticate.

## Step 2: Initialize Project
Navigate to the app directory and initialize:
```bash
cd /Users/joshisrael/Wholesale-Live-Update/app
railway init
```
- Choose "Create new project"
- Give it a name like "wholesale-live-update"

## Step 3: Add PostgreSQL Database
```bash
railway add
```
- Select "PostgreSQL" from the list
- This creates a database for your app

## Step 4: Link Your Repository
```bash
railway link
```
Select your project when prompted.

## Step 5: Set Environment Variables
Run these commands (I've generated a secure secret for you):
```bash
railway variables set NEXTAUTH_SECRET="a9l15tr45CNvfL/pI+zq4KWvhf8pUE6rCeJlq5KU97U="
railway variables set NEXTAUTH_URL="https://YOUR-APP-NAME.railway.app"
railway variables set SHOPIFY_STORE_URL="your-store.myshopify.com"
railway variables set SHOPIFY_ADMIN_API_ACCESS_TOKEN="your-shopify-token"
```

**IMPORTANT**: Replace:
- `YOUR-APP-NAME` with your actual Railway app URL (you'll get this after first deploy)
- `your-store.myshopify.com` with your Shopify store URL
- `your-shopify-token` with your Shopify Admin API token

## Step 6: Deploy!
```bash
railway up
```

## Step 7: Get Your App URL
After deployment:
```bash
railway open
```

## Step 8: Update NEXTAUTH_URL
Once you have your app URL (like `wholesale-app-production.railway.app`):
```bash
railway variables set NEXTAUTH_URL="https://wholesale-app-production.railway.app"
railway up
```

## 🎉 Done!
Your app will be live at your Railway URL!

### Test Accounts (after deployment):
- Admin: `admin@humehealth.com` / `admin123`
- Client: `client@healthcare.org` / `client123`

### Need Your Shopify Credentials?
1. Go to Shopify Admin → Apps → Develop apps
2. Create a private app with these permissions:
   - `read_products`
   - `read_orders`
   - `read_inventory`
3. Copy the Admin API access token

### Troubleshooting
- If database issues: Check Railway dashboard for DATABASE_URL
- If auth issues: Ensure NEXTAUTH_URL matches your Railway URL exactly
- View logs: `railway logs`