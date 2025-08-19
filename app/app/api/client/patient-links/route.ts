

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const bulkPurchaseId = searchParams.get('bulkPurchaseId')

    const where: any = {
      userId: session.user.id
    }
    
    if (bulkPurchaseId) {
      where.bulkPurchaseId = bulkPurchaseId
    }

    const patientLinks = await prisma.patientLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        bulkPurchase: {
          select: {
            id: true,
            productTitle: true,
            shopifyOrderNumber: true,
            quantityRemaining: true
          }
        },
        productScheme: {
          select: {
            title: true,
            sku: true,
            image: true,
            maxUnitsPerLink: true
          }
        },
        fulfillments: {
          select: {
            id: true,
            patientEmail: true,
            patientName: true,
            quantityFulfilled: true,
            fulfillmentDate: true
          }
        },
        _count: {
          select: {
            fulfillments: true
          }
        }
      }
    })

    return NextResponse.json({
      data: patientLinks
    })

  } catch (error) {
    console.error('Error fetching patient links:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bulkPurchaseId, patientEmail, patientName, notes, maxUses = 1 } = body

    // Verify the bulk purchase belongs to this user
    const bulkPurchase = await prisma.bulkPurchase.findFirst({
      where: {
        id: bulkPurchaseId,
        userId: session.user.id,
        status: 'ACTIVE',
        quantityRemaining: { gt: 0 }
      },
      include: {
        productScheme: true
      }
    })

    if (!bulkPurchase) {
      return NextResponse.json(
        { message: 'Bulk purchase not found or no remaining units' },
        { status: 404 }
      )
    }

    // Generate unique link token and URL
    const linkToken = randomBytes(32).toString('hex')
    const discountCode = `HUME-${randomBytes(8).toString('hex').toUpperCase()}`
    const customUrl = `patient/${linkToken}`

    // Create the patient link
    const patientLink = await prisma.patientLink.create({
      data: {
        userId: session.user.id,
        bulkPurchaseId,
        productSchemeId: bulkPurchase.productScheme.id,
        linkToken,
        customUrl,
        discountCode,
        maxUses,
        patientEmail,
        patientName,
        notes,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      include: {
        bulkPurchase: {
          select: {
            productTitle: true,
            shopifyOrderNumber: true
          }
        },
        productScheme: {
          select: {
            title: true,
            sku: true,
            maxUnitsPerLink: true
          }
        }
      }
    })

    return NextResponse.json({ data: patientLink }, { status: 201 })

  } catch (error) {
    console.error('Error creating patient link:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

