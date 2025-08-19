
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ProductWithInventory } from '@/lib/types';
import SearchBar from './search-bar';
import ProductCard from './product-card';
import { AlertCircle, Package, Sparkles } from 'lucide-react';

export default function InventoryTracker() {
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const searchProducts = useCallback(async (query: string) => {
    setIsLoading(true);
    setLastQuery(query);
    
    try {
      const response = await fetch(`/api/products?query=${encodeURIComponent(query ?? '')}`);
      
      if (!response?.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }
      
      const data = await response.json();
      
      if (data?.success) {
        setProducts(data?.products ?? []);
        setHasSearched(true);
        
        if (data?.count === 0) {
          toast.info(query ? `No products found for "${query}"` : 'No products found');
        } else {
          toast.success(`Found ${data?.count} product${data?.count !== 1 ? 's' : ''}`);
        }
      } else {
        throw new Error(data?.message ?? 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search products. Please try again.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (hasSearched) {
      searchProducts(lastQuery);
    } else {
      toast.info('Perform a search first to refresh results');
    }
  }, [hasSearched, lastQuery, searchProducts]);

  const getInventoryStats = () => {
    const total = products?.length ?? 0;
    const inStock = products?.filter(p => p?.inventoryStatus === 'in-stock')?.length ?? 0;
    const lowStock = products?.filter(p => p?.inventoryStatus === 'low-stock')?.length ?? 0;
    const outOfStock = products?.filter(p => p?.inventoryStatus === 'out-of-stock')?.length ?? 0;
    
    return { total, inStock, lowStock, outOfStock };
  };

  const stats = getInventoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="luxury-gradient p-3 rounded-full">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Shopify Inventory Tracker
            </h1>
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track and manage your store&apos;s inventory with real-time updates and elegant insights
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar 
          onSearch={searchProducts}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />

        {/* Stats Cards */}
        {hasSearched && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="luxury-card p-4 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
              <p className="text-gray-600 dark:text-gray-400">Total Products</p>
            </div>
            <div className="luxury-card p-4 text-center">
              <h3 className="text-2xl font-bold text-emerald-600">{stats.inStock}</h3>
              <p className="text-gray-600 dark:text-gray-400">In Stock</p>
            </div>
            <div className="luxury-card p-4 text-center">
              <h3 className="text-2xl font-bold text-amber-600">{stats.lowStock}</h3>
              <p className="text-gray-600 dark:text-gray-400">Low Stock</p>
            </div>
            <div className="luxury-card p-4 text-center">
              <h3 className="text-2xl font-bold text-red-600">{stats.outOfStock}</h3>
              <p className="text-gray-600 dark:text-gray-400">Out of Stock</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="luxury-gradient rounded-full p-4 mb-4 animate-pulse">
              <Package className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">Searching products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product?.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty States */}
        {!isLoading && hasSearched && products?.length === 0 && (
          <div className="text-center py-16">
            <div className="luxury-card p-12 max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Products Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {lastQuery 
                  ? `No products match "${lastQuery}". Try a different search term.`
                  : 'No products found in your store.'
                }
              </p>
            </div>
          </div>
        )}

        {!isLoading && !hasSearched && (
          <div className="text-center py-16">
            <div className="luxury-card p-12 max-w-md mx-auto">
              <Package className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a product name or SKU above to start tracking your inventory
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
