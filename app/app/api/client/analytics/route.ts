

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
    const period = searchParams.get('period') || '30' // days

    const periodDate = new Date()
    periodDate.setDate(periodDate.getDate() - parseInt(period))

    // Get analytics for this specific client
    const [
      totalBulkPurchases,
      activeBulkPurchases,
      totalUnitsRemaining,
      totalPatientLinks,
      totalFulfillments,
      monthlyStats
    ] = await Promise.all([
      prisma.bulkPurchase.count({
        where: { userId: session.user.id }
      }),
      prisma.bulkPurchase.count({
        where: { 
          userId: session.user.id,
          status: 'ACTIVE' 
        }
      }),
      prisma.bulkPurchase.aggregate({
        where: { userId: session.user.id },
        _sum: { quantityRemaining: true }
      }),
      prisma.patientLink.count({
        where: { 
          userId: session.user.id,
          isActive: true 
        }
      }),
      prisma.patientFulfillment.count({
        where: {
          bulkPurchase: { userId: session.user.id },
          fulfillmentDate: { gte: periodDate }
        }
      }),
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "fulfillmentDate") as month,
          COUNT(*)::int as fulfillments,
          SUM("quantityFulfilled")::int as units_fulfilled
        FROM "PatientFulfillment" pf
        JOIN "BulkPurchase" bp ON pf."bulkPurchaseId" = bp.id
        WHERE bp."userId" = ${session.user.id}
          AND pf."fulfillmentDate" >= ${periodDate}
        GROUP BY month
        ORDER BY month DESC
      `
    ])

    // Type assertion for the raw query result
    const typedMonthlyStats = monthlyStats as Array<{
      month: Date,
      fulfillments: number,
      units_fulfilled: number
    }>

    return NextResponse.json({
      summary: {
        totalBulkPurchases,
        activeBulkPurchases,
        totalUnitsRemaining: totalUnitsRemaining._sum.quantityRemaining || 0,
        totalPatientLinks,
        totalFulfillments
      },
      monthlyStats: typedMonthlyStats
    })

  } catch (error) {
    console.error('Error fetching client analytics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

