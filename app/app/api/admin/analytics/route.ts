
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
    const period = searchParams.get('period') || '30' // days

    const periodDate = new Date()
    periodDate.setDate(periodDate.getDate() - parseInt(period))

    // Get summary statistics
    const [
      totalBulkPurchases,
      activeBulkPurchases,
      totalRevenue,
      totalUnitsRemaining,
      totalPatientFulfillments,
      topProducts,
      recentActivity
    ] = await Promise.all([
      prisma.bulkPurchase.count(),
      prisma.bulkPurchase.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.bulkPurchase.aggregate({
        _sum: { totalCost: true }
      }),
      prisma.bulkPurchase.aggregate({
        _sum: { quantityRemaining: true }
      }),
      prisma.patientFulfillment.count({
        where: { createdAt: { gte: periodDate } }
      }),
      prisma.bulkPurchase.groupBy({
        by: ['productSku', 'productTitle'],
        _count: { id: true },
        _sum: { quantityPurchased: true, totalCost: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      }),
      prisma.bulkPurchase.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, companyName: true }
          }
        }
      })
    ])

    // Get monthly revenue trend
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "orderDate") as month,
        COUNT(*)::int as orders,
        SUM("totalCost")::float as revenue,
        SUM("quantityPurchased")::int as units
      FROM "BulkPurchase"
      WHERE "orderDate" >= ${periodDate}
      GROUP BY month
      ORDER BY month DESC
    ` as Array<{
      month: Date,
      orders: number,
      revenue: number,
      units: number
    }>

    return NextResponse.json({
      summary: {
        totalBulkPurchases,
        activeBulkPurchases,
        totalRevenue: totalRevenue._sum.totalCost || 0,
        totalUnitsRemaining: totalUnitsRemaining._sum.quantityRemaining || 0,
        totalPatientFulfillments
      },
      topProducts: topProducts.map(p => ({
        sku: p.productSku,
        title: p.productTitle,
        orders: p._count.id,
        totalUnits: p._sum.quantityPurchased || 0,
        totalRevenue: p._sum.totalCost || 0
      })),
      monthlyRevenue,
      recentActivity
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
