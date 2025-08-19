

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
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause for this user's purchases
    const where: any = {
      userId: session.user.id
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    const [bulkPurchases, total] = await Promise.all([
      prisma.bulkPurchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          productScheme: {
            select: {
              title: true,
              sku: true,
              image: true,
              category: {
                select: { name: true }
              }
            }
          },
          patientLinks: {
            include: {
              fulfillments: true
            }
          },
          _count: {
            select: {
              patientLinks: true,
              fulfillments: true
            }
          }
        }
      }),
      prisma.bulkPurchase.count({ where })
    ])

    return NextResponse.json({
      data: bulkPurchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching client bulk purchases:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

