

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  try {
    const { linkToken } = params
    const body = await request.json()
    const { patientEmail, patientName, phone } = body

    if (!linkToken || !patientEmail || !patientName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find and validate the patient link
    const patientLink = await prisma.patientLink.findUnique({
      where: { linkToken },
      include: {
        bulkPurchase: {
          include: {
            productScheme: true
          }
        },
        productScheme: true
      }
    })

    if (!patientLink) {
      return NextResponse.json(
        { message: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Validate link is still usable
    const now = new Date()
    const isExpired = new Date(patientLink.expiresAt || 0) < now
    const isFullyUsed = patientLink.currentUses >= patientLink.maxUses
    const isBulkPurchaseActive = patientLink.bulkPurchase.status === 'ACTIVE' && 
                                patientLink.bulkPurchase.quantityRemaining > 0

    if (!patientLink.isActive || isExpired || isFullyUsed || !isBulkPurchaseActive) {
      return NextResponse.json(
        { message: 'This link is no longer available for use' },
        { status: 410 }
      )
    }

    // Get client IP and user agent for tracking
    const clientIp = request.ip || 
                    request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Start transaction to handle fulfillment
    const result = await prisma.$transaction(async (tx) => {
      // Create patient fulfillment record
      const fulfillment = await tx.patientFulfillment.create({
        data: {
          patientLinkId: patientLink.id,
          bulkPurchaseId: patientLink.bulkPurchaseId,
          patientEmail,
          patientName,
          quantityFulfilled: patientLink.productScheme.maxUnitsPerLink,
          ipAddress: clientIp,
          userAgent,
          fulfillmentDate: now
        }
      })

      // Update patient link usage
      await tx.patientLink.update({
        where: { id: patientLink.id },
        data: {
          currentUses: { increment: 1 },
          patientEmail: patientEmail,
          patientName: patientName,
          updatedAt: now
        }
      })

      // Update bulk purchase remaining quantity
      await tx.bulkPurchase.update({
        where: { id: patientLink.bulkPurchaseId },
        data: {
          quantityRemaining: { 
            decrement: patientLink.productScheme.maxUnitsPerLink 
          },
          updatedAt: now
        }
      })

      return fulfillment
    })

    // Generate Shopify checkout URL with discount code
    const shopifyStoreUrl = process.env.SHOPIFY_STORE_URL
    const productId = patientLink.bulkPurchase.productScheme.shopifyProductId
    const variantId = patientLink.bulkPurchase.productScheme.shopifyVariantId
    const discountCode = patientLink.discountCode
    
    let checkoutUrl = null
    if (shopifyStoreUrl && productId) {
      // Create Shopify checkout URL
      const baseUrl = `https://${shopifyStoreUrl}`
      const quantity = patientLink.productScheme.maxUnitsPerLink
      
      if (variantId) {
        checkoutUrl = `${baseUrl}/cart/${variantId}:${quantity}?discount=${discountCode}`
      } else {
        checkoutUrl = `${baseUrl}/products/${productId}?discount=${discountCode}`
      }
    }

    return NextResponse.json({
      success: true,
      fulfillment: result,
      checkoutUrl,
      discountCode,
      message: 'Fulfillment processed successfully'
    })

  } catch (error) {
    console.error('Error processing patient link redemption:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

