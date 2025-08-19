
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Package, 
  Search,
  RefreshCw,
  Download,
  LogOut,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface BulkPurchase {
  id: string
  shopifyOrderNumber: string
  customerName: string
  customerEmail: string
  companyName: string
  productTitle: string
  productSku: string
  quantityPurchased: number
  quantityRemaining: number
  totalCost: number
  status: string
  orderDate: string
  user: {
    name: string
    email: string
    companyName: string
  }
  productScheme: {
    title: string
    sku: string
    image?: string
  }
  _count: {
    patientLinks: number
    fulfillments: number
  }
}

interface Analytics {
  summary: {
    totalBulkPurchases: number
    activeBulkPurchases: number
    totalRevenue: number
    totalUnitsRemaining: number
    totalPatientFulfillments: number
  }
  topProducts: Array<{
    sku: string
    title: string
    orders: number
    totalUnits: number
    totalRevenue: number
  }>
  recentActivity: BulkPurchase[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()
  const [bulkPurchases, setBulkPurchases] = useState<BulkPurchase[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bulkPurchasesRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/bulk-purchases?page=${currentPage}&search=${searchTerm}&status=${statusFilter}`),
        fetch('/api/admin/analytics')
      ])

      if (bulkPurchasesRes.ok) {
        const data = await bulkPurchasesRes.json()
        setBulkPurchases(data.data || [])
      } else {
        toast.error('Failed to fetch bulk purchases')
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      } else {
        toast.error('Failed to fetch analytics')
      }
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchData()
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

  if (!session?.user || session.user.role !== 'ADMIN') {
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
                Hume Health Admin
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>Overview</TabsTrigger>
            <TabsTrigger value="bulk-purchases" onClick={() => setActiveTab('bulk-purchases')}>Bulk Purchases</TabsTrigger>
            <TabsTrigger value="analytics" onClick={() => setActiveTab('analytics')}>Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.summary.totalBulkPurchases || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.summary.activeBulkPurchases || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(analytics?.summary.totalRevenue || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Units Remaining</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(analytics?.summary.totalUnitsRemaining || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bulk Purchases</CardTitle>
                <CardDescription>Latest bulk orders from clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.recentActivity?.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{purchase.customerName}</p>
                          <p className="text-sm text-gray-500">{purchase.productTitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${purchase.totalCost.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{purchase.quantityPurchased} units</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-purchases" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by customer name, email, product..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button onClick={fetchData} variant="outline" className="w-full sm:w-auto">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Purchases Table */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Purchases ({bulkPurchases.length})</CardTitle>
                <CardDescription>
                  Manage and track all bulk purchases from healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Links</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-medium">
                            {purchase.shopifyOrderNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{purchase.customerName}</p>
                              <p className="text-sm text-gray-500">{purchase.user.companyName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{purchase.productTitle}</p>
                              <p className="text-sm text-gray-500">SKU: {purchase.productSku}</p>
                            </div>
                          </TableCell>
                          <TableCell>{purchase.quantityPurchased}</TableCell>
                          <TableCell>
                            <div className={`font-medium ${
                              purchase.quantityRemaining <= 10 ? 'text-red-600' : 
                              purchase.quantityRemaining <= 25 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {purchase.quantityRemaining}
                            </div>
                          </TableCell>
                          <TableCell>${purchase.totalCost.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={
                              purchase.status === 'ACTIVE' ? 'default' :
                              purchase.status === 'COMPLETED' ? 'secondary' :
                              purchase.status === 'EXPIRED' ? 'destructive' :
                              'outline'
                            }>
                              {purchase.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{purchase._count.patientLinks} links</p>
                              <p className="text-gray-500">{purchase._count.fulfillments} fulfilled</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Most popular products by order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topProducts?.map((product, index) => (
                    <div key={product.sku} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.orders} orders</p>
                        <p className="text-sm text-gray-500">{product.totalUnits} units</p>
                        <p className="text-sm text-gray-500">${product.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
