
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Package, 
  Users, 
  Link as LinkIcon,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'

export default function ClientDashboard() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch client-specific data here
      // This would include their bulk purchases, patient links, etc.
      await new Promise(resolve => setTimeout(resolve, 1000)) // Placeholder
      toast.success('Data loaded successfully')
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'CLIENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {session.user.companyName || 'Client Portal'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bulk-orders">My Orders</TabsTrigger>
            <TabsTrigger value="patient-links">Patient Links</TabsTrigger>
            <TabsTrigger value="fulfillments">Fulfillments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Bulk purchases with remaining units
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Units Remaining</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Available for patient distribution
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Patient Links</CardTitle>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Active patient fulfillment links
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Patients served this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Hume Health Client Portal</CardTitle>
                <CardDescription>
                  Manage your bulk purchases and patient fulfillment efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Track Bulk Purchases</p>
                      <p className="text-sm text-gray-600">
                        Monitor your bulk orders, remaining inventory, and order history
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Generate Patient Links</p>
                      <p className="text-sm text-gray-600">
                        Create custom links for patients to receive their units at zero cost
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Track Fulfillments</p>
                      <p className="text-sm text-gray-600">
                        Monitor patient fulfillments and remaining unit allocations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Bulk Orders</CardTitle>
                    <CardDescription>
                      View and manage your bulk purchase history
                    </CardDescription>
                  </div>
                  <Button onClick={fetchData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk orders yet</h3>
                  <p className="text-gray-600 mb-4">
                    Your bulk purchases will appear here once you place orders through Shopify
                  </p>
                  <Button disabled>
                    View Shopify Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patient-links" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Links</CardTitle>
                <CardDescription>
                  Manage custom links for patient fulfillment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patient links yet</h3>
                  <p className="text-gray-600 mb-4">
                    Patient links will be generated automatically when you place bulk orders
                  </p>
                  <Button disabled>
                    Generate Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fulfillments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Fulfillments</CardTitle>
                <CardDescription>
                  Track patient fulfillment history and usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No fulfillments yet</h3>
                  <p className="text-gray-600">
                    Patient fulfillment records will appear here as patients use their links
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
