
'use client';

import Image from 'next/image';
import { Package, Tag, DollarSign, Calendar } from 'lucide-react';
import { ProductWithInventory, ShopifyVariant } from '@/lib/types';
import InventoryBadge from './inventory-badge';

interface ProductCardProps {
  product: ProductWithInventory;
}

export default function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;

  const mainImage = product?.image ?? product?.images?.[0];
  const mainVariant = product?.variants?.[0];
  const variantCount = product?.variants?.length ?? 0;
  
  const formatPrice = (price: string): string => {
    try {
      const numPrice = parseFloat(price ?? '0');
      return numPrice > 0 ? `$${numPrice.toFixed(2)}` : 'Price not set';
    } catch {
      return 'Price not available';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="luxury-card p-6 h-full flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
        {mainImage?.src ? (
          <Image
            src={mainImage.src}
            alt={mainImage?.alt ?? product?.title ?? 'Product image'}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Package size={48} />
          </div>
        )}
        
        {/* Inventory Badge Overlay */}
        <div className="absolute top-3 right-3">
          <InventoryBadge
            status={product?.inventoryStatus}
            quantity={product?.totalInventory ?? 0}
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-4">
        {/* Title and Vendor */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {product?.title ?? 'Untitled Product'}
          </h3>
          {product?.vendor && (
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              by {product.vendor}
            </p>
          )}
        </div>

        {/* Price and SKU */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign size={16} />
            {formatPrice(mainVariant?.price ?? '0')}
          </div>
          
          {mainVariant?.sku && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Tag size={16} />
              <span className="font-mono">{mainVariant.sku}</span>
            </div>
          )}
        </div>

        {/* Product Type and Status */}
        <div className="flex flex-wrap gap-2">
          {product?.product_type && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {product.product_type}
            </span>
          )}
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            product?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {product?.status ?? 'Unknown'}
          </span>
        </div>

        {/* Variants Info */}
        {variantCount > 1 && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-purple-800">
              {variantCount} variants available
            </p>
            <div className="mt-2 space-y-1">
              {product?.variants?.slice(0, 3)?.map((variant: ShopifyVariant) => (
                <div key={variant?.id} className="flex justify-between text-xs text-purple-600">
                  <span>{variant?.title ?? 'Untitled Variant'}</span>
                  <span className="font-mono">Qty: {variant?.inventory_quantity ?? 0}</span>
                </div>
              ))}
              {variantCount > 3 && (
                <p className="text-xs text-purple-500 italic">
                  +{variantCount - 3} more variants...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Updated Date */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={14} />
          Updated: {formatDate(product?.updated_at ?? '')}
        </div>
      </div>
    </div>
  );
}
