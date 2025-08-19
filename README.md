
# 🏪 Shopify Inventory Tracker

A luxurious, real-time inventory tracking application for Shopify stores. Built with Next.js, TypeScript, and Tailwind CSS for a premium user experience.

![Shopify Inventory Tracker](https://img.shields.io/badge/Shopify-API-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-cyan)

## ✨ Features

- 🔍 **Smart Product Search** - Search products by name or SKU
- 📊 **Real-time Inventory Tracking** - Live inventory levels with visual indicators
- 🎨 **Luxury UI Design** - Premium interface with smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⚡ **Fast Performance** - Optimized with Next.js and modern React patterns
- 🔐 **Secure** - Environment variables for API credentials
- 🎯 **Visual Indicators** - Color-coded inventory status (In Stock, Low Stock, Out of Stock)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or later
- Yarn package manager
- Shopify store with Admin API access

### 1. Clone the Repository

```bash
git clone https://github.com/joshn8er2022/Wholesale-Live-Update.git
cd Wholesale-Live-Update
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Setup Environment Variables

Copy the example environment file and add your Shopify credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Shopify store details:

```env
SHOPIFY_STORE_URL=https://your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here
```

### 4. Run the Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Configuration

### Shopify Setup

1. **Create a Private App** in your Shopify admin:
   - Go to `Settings > Apps and sales channels > Develop apps`
   - Create a private app
   - Enable Admin API access with these permissions:
     - `read_products`
     - `read_inventory`

2. **Get Your Credentials**:
   - Store URL: `https://your-store.myshopify.com`
   - Admin API Access Token: Found in your app settings

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SHOPIFY_STORE_URL` | Your Shopify store URL | ✅ |
| `SHOPIFY_ACCESS_TOKEN` | Admin API access token | ✅ |

## 📁 Project Structure

```
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── inventory-tracker.tsx
│   ├── product-card.tsx
│   └── search-bar.tsx
├── lib/                # Utilities and API
│   ├── shopify.ts      # Shopify API integration
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Helper functions
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   └── globals.css    # Global styles
├── prisma/            # Database schema (optional)
└── hooks/             # Custom React hooks
```

## 🎨 Design System

The application uses a luxury design system built with:

- **shadcn/ui** - High-quality React components
- **Tailwind CSS** - Utility-first CSS framework
- **Custom animations** - Smooth transitions and hover effects
- **Professional typography** - Carefully selected fonts and spacing
- **Color-coded indicators** - Visual inventory status

## 🔒 Security

- API credentials are stored securely in environment variables
- No sensitive data is committed to the repository
- Follows Shopify API best practices
- Rate limiting and error handling included

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application is compatible with:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 API Endpoints

- `GET /api/products` - Search and fetch products with inventory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ for Shopify merchants**
