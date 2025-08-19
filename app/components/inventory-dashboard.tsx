
'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Package, AlertTriangle, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShopifyProduct, InventoryItem, ApiResponse } from '@/lib/types';
import Image from 'next/image';

export default function InventoryDashboard() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const processProductsData = useCallback((products: ShopifyProduct[]): InventoryItem[] => {
    const items: InventoryItem[] = [];
    
    products?.forEach((product) => {
      if (product?.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          if (variant) {
            const stockLevel = variant?.inventory_quantity ?? 0;
            const stockStatus = 
              stockLevel > 10 ? 'normal' : 
              stockLevel > 0 ? 'low' : 
              'out_of_stock';

            items.push({
              productId: product?.id || '',
              productTitle: product?.title || 'Unknown Product',
              variant,
              stockLevel,
              stockStatus,
              imageUrl: product?.image?.src || product?.images?.[0]?.src || undefined,
            });
          }
        });
      }
    });

    return items.sort((a, b) => {
      // Sort by stock status (out of stock first, then low, then normal)
      const statusOrder = { out_of_stock: 0, low: 1, normal: 2 };
      const statusCompare = statusOrder[a.stockStatus] - statusOrder[b.stockStatus];
      
      if (statusCompare !== 0) return statusCompare;
      
      // Then sort by product title
      return (a?.productTitle || '').localeCompare(b?.productTitle || '');
    });
  }, []);

  const fetchInventoryData = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);

      const response = await fetch('/api/shopify/products');
      const result: ApiResponse<ShopifyProduct[]> = await response.json();

      if (result?.success && result?.data) {
        const processedData = processProductsData(result.data);
        setInventoryData(processedData);
        setLastUpdated(new Date());
      } else {
        throw new Error(result?.error || 'Failed to fetch inventory data');
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [processProductsData]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const getStockBadge = (stockStatus: string, stockLevel: number) => {
    switch (stockStatus) {
      case 'normal':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            In Stock ({stockLevel})
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Low Stock ({stockLevel})
          </Badge>
        );
      case 'out_of_stock':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Out of Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Unknown ({stockLevel})
          </Badge>
        );
    }
  };

  const stats = {
    total: inventoryData?.length || 0,
    inStock: inventoryData?.filter(item => item?.stockStatus === 'normal')?.length || 0,
    lowStock: inventoryData?.filter(item => item?.stockStatus === 'low')?.length || 0,
    outOfStock: inventoryData?.filter(item => item?.stockStatus === 'out_of_stock')?.length || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-primary">
            <Package className="h-8 w-8" />
            Shopify Inventory Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor your store's inventory levels in real-time
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchInventoryData} 
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Inventory
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchInventoryData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Items */}
      <div className="space-y-4">
        {inventoryData?.length > 0 ? (
          inventoryData.map((item, index) => (
            <Card 
              key={`${item?.productId}-${item?.variant?.id}-${index}`}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item?.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item?.productTitle || 'Product'}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">
                      {item?.productTitle || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Variant: {item?.variant?.title || 'Default'}
                      {item?.variant?.sku && ` • SKU: ${item.variant.sku}`}
                    </p>
                    {item?.variant?.price && (
                      <p className="text-sm text-muted-foreground">
                        Price: ${item.variant.price}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {getStockBadge(item?.stockStatus || 'unknown', item?.stockLevel || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No inventory data found</h3>
              <p className="text-muted-foreground mb-4">
                No products were found in your Shopify store or there might be an issue with the API connection.
              </p>
              <Button onClick={fetchInventoryData}>Refresh Data</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
