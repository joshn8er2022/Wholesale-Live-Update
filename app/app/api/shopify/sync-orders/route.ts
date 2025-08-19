
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface ShopifyOrder {
  id: string
  order_number: string
  created_at: string
  customer: {
    first_name?: string
    last_name?: string
    email: string
  }
  billing_address?: {
    first_name?: string
    last_name?: string
    address1?: string
    address2?: string
    city?: string
    province?: string
    country?: string
    zip?: string
  }
  shipping_address?: {
    first_name?: string
    last_name?: string
    address1?: string
    address2?: string
    city?: string
    province?: string
    country?: string
    zip?: string
  }
  line_items: Array<{
    id: string
    product_id: string
    variant_id?: string
    title: string
    variant_title?: string
    sku?: string
    quantity: number
    price: string
  }>
  total_price: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { orders } = await request.json() as { orders: ShopifyOrder[] }

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ message: 'Invalid orders data' }, { status: 400 })
    }

    let processed = 0
    let errors = 0

    for (const order of orders) {
      try {
        // Check if order already exists
        const existingSync = await prisma.shopifyOrderSync.findUnique({
          where: { shopifyOrderId: order.id }
        })

        if (existingSync && existingSync.processed) {
          continue // Skip already processed orders
        }

        // Save/update order sync record
        await prisma.shopifyOrderSync.upsert({
          where: { shopifyOrderId: order.id },
          create: {
            shopifyOrderId: order.id,
            orderNumber: order.order_number,
            orderData: order as any,
            processed: false
          },
          update: {
            orderData: order as any,
            syncedAt: new Date()
          }
        })

        // Process each line item for bulk purchase tracking
        for (const lineItem of order.line_items) {
          if (!lineItem.sku) continue

          // Check if this is a bulk purchase (you can customize this logic)
          const isBulkPurchase = lineItem.quantity >= 10 || 
            (lineItem.sku && lineItem.sku.toLowerCase().includes('bulk'))

          if (isBulkPurchase) {
            // Find the corresponding user or create if needed
            let user = await prisma.user.findUnique({
              where: { email: order.customer.email }
            })

            if (!user) {
              // Create a client user for this order
              user = await prisma.user.create({
                data: {
                  email: order.customer.email,
                  name: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim(),
                  firstName: order.customer.first_name || '',
                  lastName: order.customer.last_name || '',
                  role: 'CLIENT'
                }
              })
            }

            // Check if bulk purchase already exists
            const existingBulkPurchase = await prisma.bulkPurchase.findUnique({
              where: { shopifyOrderId: order.id }
            })

            if (!existingBulkPurchase) {
              // Create product scheme if it doesn't exist
              const productScheme = await prisma.productScheme.upsert({
                where: { sku: lineItem.sku },
                create: {
                  sku: lineItem.sku,
                  title: lineItem.title,
                  shopifyProductId: lineItem.product_id.toString(),
                  shopifyVariantId: lineItem.variant_id?.toString(),
                  unitPrice: parseFloat(lineItem.price),
                  bulkPrice: parseFloat(lineItem.price) * 0.8, // 20% bulk discount
                  minimumBulkQty: 10
                },
                update: {
                  title: lineItem.title,
                  unitPrice: parseFloat(lineItem.price),
                  bulkPrice: parseFloat(lineItem.price) * 0.8
                }
              })

              // Create bulk purchase record
              await prisma.bulkPurchase.create({
                data: {
                  userId: user.id,
                  shopifyOrderId: order.id,
                  shopifyOrderNumber: order.order_number,
                  productSku: lineItem.sku,
                  productTitle: lineItem.title,
                  productId: lineItem.product_id.toString(),
                  variantId: lineItem.variant_id?.toString(),
                  variantTitle: lineItem.variant_title,
                  quantityPurchased: lineItem.quantity,
                  quantityRemaining: lineItem.quantity,
                  unitCost: parseFloat(lineItem.price),
                  totalCost: parseFloat(lineItem.price) * lineItem.quantity,
                  customerName: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim(),
                  customerEmail: order.customer.email,
                  billingName: order.billing_address ? 
                    `${order.billing_address.first_name || ''} ${order.billing_address.last_name || ''}`.trim() : 
                    undefined,
                  billingAddress: order.billing_address ? 
                    `${order.billing_address.address1 || ''} ${order.billing_address.address2 || ''}, ${order.billing_address.city || ''}, ${order.billing_address.province || ''} ${order.billing_address.zip || ''}`.trim() :
                    undefined,
                  shippingName: order.shipping_address ? 
                    `${order.shipping_address.first_name || ''} ${order.shipping_address.last_name || ''}`.trim() : 
                    undefined,
                  shippingAddress: order.shipping_address ? 
                    `${order.shipping_address.address1 || ''} ${order.shipping_address.address2 || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.province || ''} ${order.shipping_address.zip || ''}`.trim() :
                    undefined,
                  orderDate: new Date(order.created_at),
                  discountCode: `PATIENT_${lineItem.sku}_${order.id.slice(-8)}`,
                  customLink: `https://humeheath-partner.myshopify.com/discount/PATIENT_${lineItem.sku}_${order.id.slice(-8)}`
                }
              })
            }
          }
        }

        // Mark order as processed
        await prisma.shopifyOrderSync.update({
          where: { shopifyOrderId: order.id },
          data: { processed: true }
        })

        processed++

      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error)
        errors++
        
        // Log the error
        await prisma.shopifyOrderSync.update({
          where: { shopifyOrderId: order.id },
          data: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            processed: false
          }
        }).catch(() => {}) // Ignore update errors
      }
    }

    return NextResponse.json({
      message: 'Orders sync completed',
      processed,
      errors,
      total: orders.length
    })

  } catch (error) {
    console.error('Error syncing orders:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
