
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
import { CreatePatientLinkModal } from '@/components/create-patient-link-modal'

interface BulkPurchase {
  id: string
  shopifyOrderNumber: string
  productTitle: string
  productSku: string
  quantityPurchased: number
  quantityRemaining: number
  totalCost: number
  status: string
  orderDate: string
  productScheme: {
    title: string
    sku: string
    image?: string
    category?: { name: string }
  }
  _count: {
    patientLinks: number
    fulfillments: number
  }
}

interface PatientLink {
  id: string
  linkToken: string
  customUrl: string
  discountCode: string
  maxUses: number
  currentUses: number
  isActive: boolean
  patientEmail?: string
  patientName?: string
  expiresAt: string
  bulkPurchase: {
    productTitle: string
    shopifyOrderNumber: string
    quantityRemaining: number
  }
  productScheme: {
    title: string
    sku: string
    maxUnitsPerLink: number
  }
}

interface PatientFulfillment {
  id: string
  patientEmail: string
  patientName?: string
  quantityFulfilled: number
  fulfillmentDate: string
  bulkPurchase: {
    productTitle: string
    shopifyOrderNumber: string
    productSku: string
  }
}

interface ClientAnalytics {
  summary: {
    totalBulkPurchases: number
    activeBulkPurchases: number
    totalUnitsRemaining: number
    totalPatientLinks: number
    totalFulfillments: number
  }
}

export default function ClientDashboard() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [bulkPurchases, setBulkPurchases] = useState<BulkPurchase[]>([])
  const [patientLinks, setPatientLinks] = useState<PatientLink[]>([])
  const [fulfillments, setFulfillments] = useState<PatientFulfillment[]>([])
  const [analytics, setAnalytics] = useState<ClientAnalytics | null>(null)

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
      const [bulkPurchasesRes, patientLinksRes, fulfillmentsRes, analyticsRes] = await Promise.all([
        fetch('/api/client/bulk-purchases'),
        fetch('/api/client/patient-links'),
        fetch('/api/client/fulfillments'),
        fetch('/api/client/analytics')
      ])

      if (bulkPurchasesRes.ok) {
        const data = await bulkPurchasesRes.json()
        setBulkPurchases(data.data || [])
      }

      if (patientLinksRes.ok) {
        const data = await patientLinksRes.json()
        setPatientLinks(data.data || [])
      }

      if (fulfillmentsRes.ok) {
        const data = await fulfillmentsRes.json()
        setFulfillments(data.data || [])
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>Overview</TabsTrigger>
            <TabsTrigger value="bulk-orders" onClick={() => setActiveTab('bulk-orders')}>My Orders</TabsTrigger>
            <TabsTrigger value="patient-links" onClick={() => setActiveTab('patient-links')}>Patient Links</TabsTrigger>
            <TabsTrigger value="fulfillments" onClick={() => setActiveTab('fulfillments')}>Fulfillments</TabsTrigger>
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
                  <div className="text-2xl font-bold">{analytics?.summary.activeBulkPurchases || 0}</div>
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
                  <div className="text-2xl font-bold">{analytics?.summary.totalUnitsRemaining || 0}</div>
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
                  <div className="text-2xl font-bold">{analytics?.summary.totalPatientLinks || 0}</div>
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
                  <div className="text-2xl font-bold">{analytics?.summary.totalFulfillments || 0}</div>
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
                    <CardTitle>My Bulk Orders ({bulkPurchases.length})</CardTitle>
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
                {bulkPurchases.length === 0 ? (
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
                ) : (
                  <div className="space-y-4">
                    {bulkPurchases.map((purchase) => (
                      <Card key={purchase.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              {purchase.productScheme.image && (
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                                  <img 
                                    src={purchase.productScheme.image} 
                                    alt={purchase.productTitle}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-lg mb-1">{purchase.productTitle}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  Order #{purchase.shopifyOrderNumber} • SKU: {purchase.productSku}
                                </p>
                                <div className="flex items-center space-x-6 text-sm">
                                  <div>
                                    <span className="text-gray-500">Purchased:</span>
                                    <span className="font-medium ml-1">{purchase.quantityPurchased} units</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Remaining:</span>
                                    <span className={`font-medium ml-1 ${
                                      purchase.quantityRemaining <= 0 ? 'text-red-600' :
                                      purchase.quantityRemaining <= 10 ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`}>
                                      {purchase.quantityRemaining} units
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Patient Links:</span>
                                    <span className="font-medium ml-1">{purchase._count.patientLinks}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={
                              purchase.status === 'ACTIVE' ? 'default' :
                              purchase.status === 'COMPLETED' ? 'secondary' :
                              'destructive'
                            }>
                              {purchase.status}
                            </Badge>
                            <div className="text-right">
                              <p className="font-semibold text-lg">${purchase.totalCost.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(purchase.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patient-links" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Patient Links ({patientLinks.length})</CardTitle>
                    <CardDescription>
                      Manage custom links for patient fulfillment
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <CreatePatientLinkModal 
                      bulkPurchases={bulkPurchases}
                      onLinkCreated={fetchData}
                    />
                    <Button onClick={fetchData} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {patientLinks.length === 0 ? (
                  <div className="text-center py-12">
                    <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No patient links yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create patient links from your active bulk orders to enable zero-cost fulfillment
                    </p>
                    {bulkPurchases.filter(p => p.status === 'ACTIVE' && p.quantityRemaining > 0).length > 0 && (
                      <CreatePatientLinkModal 
                        bulkPurchases={bulkPurchases}
                        onLinkCreated={fetchData}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientLinks.map((link) => (
                      <Card key={link.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-medium text-lg mb-1">
                                  {link.bulkPurchase.productTitle}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Order #{link.bulkPurchase.shopifyOrderNumber}
                                </p>
                              </div>
                              <Badge variant={link.isActive ? 'default' : 'secondary'}>
                                {link.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Patient Email</p>
                                <p className="font-medium">{link.patientEmail || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Patient Name</p>
                                <p className="font-medium">{link.patientName || 'Not specified'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Discount Code</p>
                                <p className="font-mono font-medium">{link.discountCode}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Uses</p>
                                <p className="font-medium">{link.currentUses} / {link.maxUses}</p>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">Patient Link</p>
                              <div className="flex items-center space-x-2">
                                <code className="flex-1 text-sm bg-white p-2 rounded border">
                                  {typeof window !== 'undefined' ? window.location.origin : ''}/{link.customUrl}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    if (typeof window !== 'undefined') {
                                      navigator.clipboard.writeText(`${window.location.origin}/${link.customUrl}`)
                                      toast.success('Link copied to clipboard')
                                    }
                                  }}
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {new Date(link.expiresAt) < new Date() && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                              <p className="text-sm text-red-800">
                                This link expired on {new Date(link.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fulfillments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient Fulfillments ({fulfillments.length})</CardTitle>
                    <CardDescription>
                      Track patient fulfillment history and usage
                    </CardDescription>
                  </div>
                  <Button onClick={fetchData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fulfillments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No fulfillments yet</h3>
                    <p className="text-gray-600">
                      Patient fulfillment records will appear here as patients use their links
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fulfillments.map((fulfillment) => (
                      <Card key={fulfillment.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <h4 className="font-medium text-lg">
                                {fulfillment.bulkPurchase.productTitle}
                              </h4>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Patient Email</p>
                                <p className="font-medium">{fulfillment.patientEmail}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Patient Name</p>
                                <p className="font-medium">{fulfillment.patientName || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Product SKU</p>
                                <p className="font-mono text-xs">{fulfillment.bulkPurchase.productSku}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Units Fulfilled</p>
                                <p className="font-medium">{fulfillment.quantityFulfilled}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="mb-2">
                              Fulfilled
                            </Badge>
                            <p className="text-sm text-gray-500">
                              {new Date(fulfillment.fulfillmentDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
