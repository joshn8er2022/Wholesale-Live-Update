
'use client';

import { shopifyAPI } from '@/lib/shopify';

interface InventoryBadgeProps {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity: number;
  animated?: boolean;
}

export default function InventoryBadge({ 
  status, 
  quantity, 
  animated = true 
}: InventoryBadgeProps) {
  const colorClasses = shopifyAPI.getInventoryStatusColor(status);
  const icon = shopifyAPI.getInventoryStatusIcon(status);
  
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border
      ${colorClasses}
      ${animated ? 'inventory-pulse' : ''}
      transition-all duration-200
    `}>
      <span className="text-base">{icon}</span>
      <span>{getStatusText(status)}</span>
      <span className="font-bold">({quantity ?? 0})</span>
    </div>
  );
}
