

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Gift,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import Image from 'next/image'

interface PatientLinkData {
  id: string
  linkToken: string
  discountCode: string
  maxUses: number
  currentUses: number
  isActive: boolean
  expiresAt: string
  patientEmail?: string
  patientName?: string
  bulkPurchase: {
    productTitle: string
    customerName: string
    quantityRemaining: number
  }
  productScheme: {
    title: string
    sku: string
    image?: string
    maxUnitsPerLink: number
    unitPrice: number
  }
}

interface PatientForm {
  email: string
  firstName: string
  lastName: string
  phone?: string
}

export default function PatientLinkPage() {
  const params = useParams()
  const router = useRouter()
  const [linkData, setLinkData] = useState<PatientLinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [fulfilled, setFulfilled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PatientForm>()

  useEffect(() => {
    if (params?.linkToken) {
      fetchLinkData(params.linkToken as string)
    }
  }, [params?.linkToken])

  const fetchLinkData = async (token: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/patient/link/${token}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Invalid or expired link')
        } else if (response.status === 410) {
          setError('This link has been fully used')
        } else {
          setError('Failed to load link information')
        }
        return
      }

      const data = await response.json()
      setLinkData(data.link)

      // Pre-fill form if patient info exists
      if (data.link.patientEmail) {
        setValue('email', data.link.patientEmail)
      }
      if (data.link.patientName) {
        const names = data.link.patientName.split(' ')
        setValue('firstName', names[0] || '')
        setValue('lastName', names.slice(1).join(' ') || '')
      }

    } catch (error) {
      console.error('Error fetching link data:', error)
      setError('Failed to load link information')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (formData: PatientForm) => {
    if (!linkData) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/patient/link/${linkData.linkToken}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientEmail: formData.email,
          patientName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to process request')
      }

      setFulfilled(true)
      toast.success('Fulfillment processed successfully!')

      // Redirect to Shopify checkout if URL provided
      if (result.checkoutUrl) {
        setTimeout(() => {
          window.location.href = result.checkoutUrl
        }, 2000)
      }

    } catch (error: any) {
      console.error('Error processing fulfillment:', error)
      toast.error(error.message || 'Failed to process fulfillment')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-900">Link Error</CardTitle>
            <CardDescription className="text-red-700">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (fulfilled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-900">Success!</CardTitle>
            <CardDescription className="text-green-700">
              Your fulfillment has been processed. You will be redirected to complete your order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  {linkData?.productScheme.title}
                </h3>
                <p className="text-sm text-green-700">
                  Quantity: {linkData?.productScheme.maxUnitsPerLink} unit(s)
                </p>
                <p className="text-sm text-green-700">
                  Discount Code: <code className="font-mono">{linkData?.discountCode}</code>
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-600" />
              <p className="text-sm text-green-600">Redirecting to checkout...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!linkData) return null

  const isExpired = new Date(linkData.expiresAt) < new Date()
  const isFullyUsed = linkData.currentUses >= linkData.maxUses
  const canUse = linkData.isActive && !isExpired && !isFullyUsed

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hume Health Patient Portal
          </h1>
          <p className="text-lg text-gray-600">
            Complete your information to receive your product
          </p>
        </div>

        {/* Product Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {linkData.productScheme.image && (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 relative">
                  <Image 
                    src={linkData.productScheme.image}
                    alt={linkData.productScheme.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">
                  {linkData.productScheme.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-mono">{linkData.productScheme.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{linkData.productScheme.maxUnitsPerLink} unit(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retail Value:</span>
                    <span className="font-medium">${(linkData.productScheme.unitPrice * linkData.productScheme.maxUnitsPerLink).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Cost:</span>
                    <span className="font-bold text-green-600 text-lg">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant={linkData.isActive ? 'default' : 'secondary'}>
              {linkData.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={isExpired ? 'destructive' : 'secondary'}>
              {isExpired ? 'Expired' : 'Valid'}
            </Badge>
            <Badge variant={isFullyUsed ? 'destructive' : 'secondary'}>
              {linkData.currentUses} / {linkData.maxUses} Uses
            </Badge>
          </div>
          
          {!canUse && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">
                  {isExpired && 'This link has expired.'}
                  {isFullyUsed && !isExpired && 'This link has been fully used.'}
                  {!linkData.isActive && !isExpired && !isFullyUsed && 'This link is no longer active.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Patient Information Form */}
        {canUse && (
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>
                Please provide your information to complete the fulfillment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>
                    Provided by <strong>{linkData.bulkPurchase.customerName}</strong>
                  </p>
                  <p className="mt-2">
                    By proceeding, you agree to receive this product at no cost as part of a bulk purchase program.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Provider Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">About This Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                This product is being provided at no cost to you as part of a bulk purchase program 
                administered by <strong>{linkData.bulkPurchase.customerName}</strong>.
              </p>
              <p>
                The discount code <code className="font-mono bg-gray-100 px-2 py-1 rounded">
                {linkData.discountCode}
                </code> will be automatically applied at checkout to ensure you receive this product at no cost.
              </p>
              <p>
                For questions about this program, please contact your healthcare provider directly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

