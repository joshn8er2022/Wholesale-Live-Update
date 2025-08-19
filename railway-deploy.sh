#!/bin/bash

echo "🚀 Railway Deployment Script for Wholesale Live Update"
echo "======================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /Users/joshisrael/Wholesale-Live-Update/app

echo -e "${YELLOW}Step 1: Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo -e "${GREEN}✓ Railway CLI is installed${NC}"
fi

echo ""
echo -e "${YELLOW}Step 2: Login to Railway${NC}"
echo "Running: railway login"
echo "(This will open your browser for authentication)"
railway login

echo ""
echo -e "${YELLOW}Step 3: Initialize Railway Project${NC}"
echo "Running: railway init"
railway init

echo ""
echo -e "${YELLOW}Step 4: Add PostgreSQL Database${NC}"
echo "Select PostgreSQL when prompted:"
railway add

echo ""
echo -e "${YELLOW}Step 5: Link to Project${NC}"
railway link

echo ""
echo -e "${YELLOW}Step 6: Setting Environment Variables${NC}"
echo "Setting up your Shopify credentials and auth secrets..."

# Set all environment variables
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set SHOPIFY_STORE_URL="${SHOPIFY_STORE_URL:-YOUR-STORE.myshopify.com}"
railway variables set SHOPIFY_ADMIN_API_ACCESS_TOKEN="${SHOPIFY_TOKEN:-YOUR-SHOPIFY-TOKEN}"

echo -e "${GREEN}✓ Environment variables set${NC}"

echo ""
echo -e "${YELLOW}Step 7: Deploying to Railway${NC}"
echo "Running: railway up"
railway up

echo ""
echo -e "${GREEN}🎉 Deployment initiated!${NC}"
echo ""
echo "After deployment completes:"
echo "1. Run: railway open (to get your app URL)"
echo "2. Update NEXTAUTH_URL with your Railway URL:"
echo "   railway variables set NEXTAUTH_URL='https://YOUR-APP.railway.app'"
echo "   railway up"
echo ""
echo "Test accounts:"
echo "  Admin: admin@humehealth.com / admin123"
echo "  Client: client@healthcare.org / client123"