

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    const skip = (page - 1) * limit

    // Get fulfillments for this client's bulk purchases
    const [fulfillments, total] = await Promise.all([
      prisma.patientFulfillment.findMany({
        where: {
          bulkPurchase: {
            userId: session.user.id
          }
        },
        skip,
        take: limit,
        orderBy: { fulfillmentDate: 'desc' },
        include: {
          patientLink: {
            select: {
              customUrl: true,
              discountCode: true,
              patientEmail: true,
              patientName: true
            }
          },
          bulkPurchase: {
            select: {
              productTitle: true,
              shopifyOrderNumber: true,
              productSku: true
            }
          }
        }
      }),
      prisma.patientFulfillment.count({
        where: {
          bulkPurchase: {
            userId: session.user.id
          }
        }
      })
    ])

    return NextResponse.json({
      data: fulfillments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching fulfillments:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

