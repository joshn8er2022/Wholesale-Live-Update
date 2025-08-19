

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { linkToken: string } }
) {
  try {
    const { linkToken } = params

    if (!linkToken) {
      return NextResponse.json(
        { message: 'Link token is required' },
        { status: 400 }
      )
    }

    // Find the patient link
    const patientLink = await prisma.patientLink.findUnique({
      where: { linkToken },
      include: {
        bulkPurchase: {
          select: {
            id: true,
            productTitle: true,
            customerName: true,
            quantityRemaining: true,
            status: true
          }
        },
        productScheme: {
          select: {
            title: true,
            sku: true,
            image: true,
            maxUnitsPerLink: true,
            unitPrice: true
          }
        },
        fulfillments: {
          select: {
            id: true,
            quantityFulfilled: true,
            fulfillmentDate: true
          }
        }
      }
    })

    if (!patientLink) {
      return NextResponse.json(
        { message: 'Invalid or expired link' },
        { status: 404 }
      )
    }

    // Check if link is still valid
    const now = new Date()
    const expiresAt = new Date(patientLink.expiresAt || 0)
    const isExpired = expiresAt < now

    // Check if fully used
    const isFullyUsed = patientLink.currentUses >= patientLink.maxUses

    // Check if bulk purchase is still active
    const isBulkPurchaseActive = patientLink.bulkPurchase.status === 'ACTIVE' && 
                                patientLink.bulkPurchase.quantityRemaining > 0

    if (!patientLink.isActive || isExpired || isFullyUsed || !isBulkPurchaseActive) {
      return NextResponse.json(
        { 
          message: 'This link is no longer available',
          reason: {
            inactive: !patientLink.isActive,
            expired: isExpired,
            fullyUsed: isFullyUsed,
            noBulkInventory: !isBulkPurchaseActive
          }
        },
        { status: 410 }
      )
    }

    return NextResponse.json({
      link: patientLink
    })

  } catch (error) {
    console.error('Error fetching patient link:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

