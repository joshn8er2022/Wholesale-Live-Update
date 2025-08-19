#!/bin/bash

echo "======================================"
echo "Deployment Setup for Wholesale Live Update"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "app/package.json" ]; then
    echo "Error: Please run this script from the Wholesale-Live-Update root directory"
    exit 1
fi

cd app

echo "Choose your deployment platform:"
echo "1) Railway (Recommended - includes database)"
echo "2) Vercel (Fast, but needs external database)"
echo "3) Local Development"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "=== RAILWAY DEPLOYMENT ==="
        echo ""
        echo "Steps to deploy on Railway:"
        echo ""
        echo "1. Install Railway CLI (if not installed):"
        echo "   npm install -g @railway/cli"
        echo ""
        echo "2. Login to Railway:"
        echo "   railway login"
        echo ""
        echo "3. Initialize Railway project:"
        echo "   railway init"
        echo ""
        echo "4. Add PostgreSQL database:"
        echo "   railway add"
        echo "   (Select PostgreSQL)"
        echo ""
        echo "5. Set environment variables:"
        echo "   railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)"
        echo "   railway variables set NEXTAUTH_URL=https://YOUR-APP.railway.app"
        echo "   railway variables set SHOPIFY_STORE_URL=your-store.myshopify.com"
        echo "   railway variables set SHOPIFY_ADMIN_API_ACCESS_TOKEN=your-token"
        echo ""
        echo "6. Deploy:"
        echo "   railway up"
        echo ""
        echo "Railway config file created at: app/railway.json"
        ;;
        
    2)
        echo ""
        echo "=== VERCEL DEPLOYMENT ==="
        echo ""
        
        # Create vercel.json
        cat > vercel.json << 'EOF'
{
  "buildCommand": "npm install && npx prisma generate",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
EOF
        
        echo "Steps to deploy on Vercel:"
        echo ""
        echo "1. Install Vercel CLI (if not installed):"
        echo "   npm install -g vercel"
        echo ""
        echo "2. Login to Vercel:"
        echo "   vercel login"
        echo ""
        echo "3. Deploy:"
        echo "   vercel"
        echo ""
        echo "4. Set environment variables in Vercel Dashboard:"
        echo "   - DATABASE_URL (You'll need a PostgreSQL database like Neon or Supabase)"
        echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
        echo "   - NEXTAUTH_URL (your Vercel URL)"
        echo "   - SHOPIFY_STORE_URL"
        echo "   - SHOPIFY_ADMIN_API_ACCESS_TOKEN"
        echo ""
        echo "Vercel config file created at: app/vercel.json"
        ;;
        
    3)
        echo ""
        echo "=== LOCAL DEVELOPMENT SETUP ==="
        echo ""
        
        # Check for SQLite schema
        if [ ! -f "prisma/schema.sqlite.prisma" ]; then
            echo "Creating SQLite schema for local development..."
            
            # Create SQLite schema
            cat > prisma/schema.sqlite.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id             String          @id @default(cuid())
  email          String          @unique
  password       String
  name           String?
  role           String          @default("CLIENT")
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  bulkPurchases  BulkPurchase[]
  patientLinks   PatientLink[]
}

model BulkPurchase {
  id            String         @id @default(cuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id])
  productName   String
  quantity      Int
  unitPrice     Float
  totalAmount   Float
  status        String         @default("PENDING")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  patientLinks  PatientLink[]
  redemptions   Redemption[]
}

model PatientLink {
  id              String        @id @default(cuid())
  bulkPurchaseId  String
  bulkPurchase    BulkPurchase  @relation(fields: [bulkPurchaseId], references: [id])
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  linkToken       String        @unique
  patientEmail    String?
  patientName     String?
  status          String        @default("PENDING")
  expiresAt       DateTime
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  redemptions     Redemption[]
}

model Redemption {
  id              String        @id @default(cuid())
  patientLinkId   String
  patientLink     PatientLink   @relation(fields: [patientLinkId], references: [id])
  bulkPurchaseId  String
  bulkPurchase    BulkPurchase  @relation(fields: [bulkPurchaseId], references: [id])
  redeemedAt      DateTime      @default(now())
  status          String        @default("COMPLETED")
}

model ProductScheme {
  id            String    @id @default(cuid())
  name          String
  description   String?
  price         Float
  sku           String?   @unique
  shopifyId     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
EOF
        fi
        
        # Create .env file
        if [ ! -f ".env" ]; then
            echo "Creating .env file..."
            cat > .env << 'EOF'
# Database (SQLite for local)
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# Shopify API Configuration (add your credentials)
SHOPIFY_STORE_URL="your-store.myshopify.com"
SHOPIFY_ADMIN_API_ACCESS_TOKEN="your-token"

# Optional: AbacusAI
ABACUSAI_API_KEY=""
EOF
            echo ".env file created. Please update with your Shopify credentials."
        fi
        
        echo "Installing dependencies..."
        npm install
        
        echo ""
        echo "Setting up SQLite database..."
        npm run db:generate:sqlite
        npm run db:push:sqlite
        
        echo ""
        echo "Seeding database with test data..."
        npm run db:seed:sqlite
        
        echo ""
        echo "=== Setup Complete! ==="
        echo ""
        echo "To start the development server:"
        echo "   cd app && npm run dev"
        echo ""
        echo "Test accounts:"
        echo "   Admin: admin@humehealth.com / admin123"
        echo "   Client: client@healthcare.org / client123"
        echo ""
        echo "Access at: http://localhost:3000"
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "Setup complete!"