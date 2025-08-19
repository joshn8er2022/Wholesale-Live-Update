
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Building2, Users, ShoppingCart, BarChart3 } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Hume Health
            </h1>
            <h2 className="text-2xl text-gray-700 mb-4">
              Client Portal & Bulk Purchase Management
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your bulk purchases, track inventory, and manage patient fulfillment 
              with our comprehensive healthcare logistics platform.
            </p>
            <div className="space-x-4">
              <Link href="/auth/signin">
                <Button size="lg" className="px-8 py-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Client Portal</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure access for healthcare providers to manage bulk purchases and patient fulfillment
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Bulk Purchase Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track bulk orders, remaining inventory, and associate purchases with patient fulfillment schemes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Patient Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate custom patient links with discount codes for seamless zero-cost fulfillment
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Analytics & Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive analytics on order history, fulfillment rates, and inventory management
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h4 className="text-xl font-semibold">Bulk Purchase</h4>
                <p className="text-gray-600">
                  Healthcare providers place bulk orders through Shopify for discounted rates
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h4 className="text-xl font-semibold">Patient Links</h4>
                <p className="text-gray-600">
                  Custom links with discount codes are generated for each patient to receive their units
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h4 className="text-xl font-semibold">Zero-Cost Fulfillment</h4>
                <p className="text-gray-600">
                  Patients receive their products at zero cost through the pre-paid bulk purchase system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
