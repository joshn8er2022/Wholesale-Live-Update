#!/bin/bash
set -e

echo "🚀 Deploying Wholesale Live Update to Railway"
echo "=============================================="
echo ""

# Step 1: Login
echo "📝 Step 1: Logging into Railway..."
railway login

# Step 2: Init project
echo ""
echo "📦 Step 2: Creating Railway project..."
railway init

# Step 3: Add database
echo ""
echo "🗄️ Step 3: Adding PostgreSQL database..."
echo "SELECT 'PostgreSQL' when prompted!"
railway add

# Step 4: Set environment variables
echo ""
echo "🔐 Step 4: Setting environment variables..."
railway variables set \
  NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  SHOPIFY_STORE_URL="${SHOPIFY_STORE_URL:-YOUR-STORE.myshopify.com}" \
  SHOPIFY_ADMIN_API_ACCESS_TOKEN="${SHOPIFY_TOKEN:-YOUR-SHOPIFY-TOKEN}" \
  NODE_ENV="production"

# Step 5: Deploy
echo ""
echo "🚀 Step 5: Deploying application..."
railway up

# Step 6: Get URL
echo ""
echo "🌐 Step 6: Getting application URL..."
railway open

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️ IMPORTANT: After you get your app URL, update NEXTAUTH_URL:"
echo "railway variables set NEXTAUTH_URL='https://YOUR-APP-NAME.railway.app'"
echo "railway up"
echo ""
echo "Test accounts:"
echo "  Admin: admin@humehealth.com / admin123"
echo "  Client: client@healthcare.org / client123"