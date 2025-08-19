
import { ShopifyProduct, InventoryLevel, ProductWithInventory } from './types';

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || 'https://your-store.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '';

export class ShopifyAPI {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01`;
    this.headers = {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    };
  }

  async fetchProducts(query: string = '', limit: number = 50): Promise<ShopifyProduct[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        fields: 'id,title,handle,vendor,product_type,status,tags,variants,images,image',
      });

      if (query?.trim()) {
        params.append('title', query);
      }

      const response = await fetch(`${this.baseUrl}/products.json?${params}`, {
        headers: this.headers,
      });

      if (!response?.ok) {
        throw new Error(`Shopify API error: ${response?.status} ${response?.statusText}`);
      }

      const data = await response.json();
      return data?.products ?? [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async fetchInventoryLevels(inventoryItemIds: string[]): Promise<InventoryLevel[]> {
    try {
      if (!inventoryItemIds?.length) return [];

      const params = new URLSearchParams({
        inventory_item_ids: inventoryItemIds.join(','),
      });

      const response = await fetch(`${this.baseUrl}/inventory_levels.json?${params}`, {
        headers: this.headers,
      });

      if (!response?.ok) {
        throw new Error(`Shopify API error: ${response?.status} ${response?.statusText}`);
      }

      const data = await response.json();
      return data?.inventory_levels ?? [];
    } catch (error) {
      console.error('Error fetching inventory levels:', error);
      throw error;
    }
  }

  async searchProducts(query: string): Promise<ProductWithInventory[]> {
    try {
      const products = await this.fetchProducts(query);
      
      // Get inventory item IDs from all variants
      const inventoryItemIds = products
        ?.flatMap(product => product?.variants ?? [])
        ?.map(variant => variant?.inventory_item_id)
        ?.filter(Boolean) ?? [];

      // Fetch inventory levels
      const inventoryLevels = await this.fetchInventoryLevels(inventoryItemIds);
      
      // Create inventory map for quick lookup
      const inventoryMap = new Map<string, InventoryLevel[]>();
      inventoryLevels?.forEach(level => {
        const existing = inventoryMap.get(level?.inventory_item_id) ?? [];
        inventoryMap.set(level?.inventory_item_id, [...existing, level]);
      });

      // Combine products with inventory data
      return products?.map(product => {
        const totalInventory = product?.variants?.reduce((total, variant) => {
          const levels = inventoryMap.get(variant?.inventory_item_id) ?? [];
          const variantInventory = levels?.reduce((sum, level) => sum + (level?.available ?? 0), 0) ?? 0;
          return total + variantInventory;
        }, 0) ?? 0;

        let inventoryStatus: 'in-stock' | 'low-stock' | 'out-of-stock' = 'out-of-stock';
        if (totalInventory > 10) {
          inventoryStatus = 'in-stock';
        } else if (totalInventory > 0) {
          inventoryStatus = 'low-stock';
        }

        return {
          ...product,
          totalInventory,
          inventoryStatus,
        };
      }) ?? [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  getInventoryStatusColor(status: string): string {
    switch (status) {
      case 'in-stock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'low-stock':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getInventoryStatusIcon(status: string): string {
    switch (status) {
      case 'in-stock':
        return '✅';
      case 'low-stock':
        return '⚠️';
      case 'out-of-stock':
        return '❌';
      default:
        return '❓';
    }
  }
}

export const shopifyAPI = new ShopifyAPI();
