
import { NextRequest, NextResponse } from 'next/server';
import { ShopifyProduct, ApiResponse } from '@/lib/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
    const SHOPIFY_ADMIN_API_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    if (!SHOPIFY_STORE_URL || !SHOPIFY_ADMIN_API_ACCESS_TOKEN) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Shopify configuration is missing in environment variables' 
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    const url = `https://${SHOPIFY_STORE_URL}/admin/api/2023-10/products.json?limit=250&fields=id,title,handle,vendor,product_type,created_at,updated_at,status,variants,image,images`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API Error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Shopify API error: ${response.status} ${response.statusText}` 
        } as ApiResponse<null>,
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data?.products || []
    } as ApiResponse<ShopifyProduct[]>);

  } catch (error: any) {
    console.error('Error fetching Shopify products:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to fetch inventory data' 
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
