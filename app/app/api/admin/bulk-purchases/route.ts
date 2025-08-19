
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const productSku = searchParams.get('productSku') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { productTitle: { contains: search, mode: 'insensitive' } },
        { shopifyOrderNumber: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (productSku) {
      where.productSku = productSku
    }

    const [bulkPurchases, total] = await Promise.all([
      prisma.bulkPurchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
            }
          },
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
    console.error('Error fetching bulk purchases:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
