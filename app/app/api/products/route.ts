
import { NextRequest, NextResponse } from 'next/server';
import { shopifyAPI } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request?.url ?? '');
    const query = searchParams?.get('query') ?? '';
    
    const products = await shopifyAPI.searchProducts(query);
    
    return NextResponse.json({ 
      success: true, 
      products,
      count: products?.length ?? 0
    });
  } catch (error) {
    console.error('Products API error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
