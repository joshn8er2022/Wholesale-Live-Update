#!/bin/bash

echo "🚀 Railway Deployment with Token"
echo "================================="
echo ""

cd /Users/joshisrael/Wholesale-Live-Update/app

# Export the Railway token
export RAILWAY_TOKEN="fb72ea04-2eab-486f-9801-d096f6ee0d24"

echo "Using Railway token: fb72ea04-2eab-486f-9801-d096f6ee0d24"
echo ""

# First, let's try to login with browser
echo "Step 1: Login to Railway"
echo "This will open your browser for authentication..."
railway login

echo ""
echo "Step 2: Creating/Linking Railway project..."

# Try to link to existing project or create new
railway link || railway init

echo ""
echo "Step 3: Setting environment variables..."

# Set all environment variables for your Shopify integration
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set SHOPIFY_STORE_URL="${SHOPIFY_STORE_URL:-YOUR-STORE.myshopify.com}" 
railway variables set SHOPIFY_ADMIN_API_ACCESS_TOKEN="${SHOPIFY_TOKEN:-YOUR-SHOPIFY-TOKEN}"

echo ""
echo "Step 4: Adding PostgreSQL database..."
echo "When prompted, select PostgreSQL"
railway add

echo ""
echo "Step 5: Deploying application..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "To get your app URL, run:"
echo "  railway open"
echo ""
echo "Then update NEXTAUTH_URL:"
echo "  railway variables set NEXTAUTH_URL='https://YOUR-APP.railway.app'"
echo "  railway up"