

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface BulkPurchase {
  id: string
  shopifyOrderNumber: string
  productTitle: string
  quantityRemaining: number
  status: string
}

interface CreatePatientLinkModalProps {
  bulkPurchases: BulkPurchase[]
  onLinkCreated: () => void
}

interface PatientLinkForm {
  bulkPurchaseId: string
  patientEmail: string
  patientName: string
  notes?: string
  maxUses: number
}

export function CreatePatientLinkModal({ bulkPurchases, onLinkCreated }: CreatePatientLinkModalProps) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<PatientLinkForm>({
    defaultValues: {
      maxUses: 1
    }
  })

  const selectedBulkPurchaseId = watch('bulkPurchaseId')
  const availablePurchases = bulkPurchases.filter(p => p.status === 'ACTIVE' && p.quantityRemaining > 0)

  const onSubmit = async (data: PatientLinkForm) => {
    setCreating(true)
    try {
      const response = await fetch('/api/client/patient-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create patient link')
      }

      const result = await response.json()
      
      toast.success('Patient link created successfully!')
      setOpen(false)
      reset()
      onLinkCreated()

    } catch (error: any) {
      console.error('Error creating patient link:', error)
      toast.error(error.message || 'Failed to create patient link')
    } finally {
      setCreating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Patient Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Patient Link</DialogTitle>
          <DialogDescription>
            Generate a custom link for a patient to receive their product at zero cost.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="bulkPurchaseId">Select Bulk Order *</Label>
            <Select 
              onValueChange={(value) => setValue('bulkPurchaseId', value)}
              defaultValue=""
            >
              <SelectTrigger className={errors.bulkPurchaseId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose a bulk order" />
              </SelectTrigger>
              <SelectContent>
                {availablePurchases.length === 0 ? (
                  <SelectItem value="no-orders" disabled>
                    No active orders with remaining units
                  </SelectItem>
                ) : (
                  availablePurchases.map((purchase) => (
                    <SelectItem key={purchase.id} value={purchase.id}>
                      <div className="flex flex-col">
                        <span>{purchase.productTitle}</span>
                        <span className="text-xs text-gray-500">
                          Order #{purchase.shopifyOrderNumber} • {purchase.quantityRemaining} remaining
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <input
              type="hidden"
              {...register('bulkPurchaseId', { required: 'Please select a bulk order' })}
            />
            {errors.bulkPurchaseId && (
              <p className="text-sm text-red-600 mt-1">{errors.bulkPurchaseId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="patientEmail">Patient Email *</Label>
            <Input
              id="patientEmail"
              type="email"
              {...register('patientEmail', { 
                required: 'Patient email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              className={errors.patientEmail ? 'border-red-500' : ''}
              placeholder="patient@example.com"
            />
            {errors.patientEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.patientEmail.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              type="text"
              {...register('patientName', { required: 'Patient name is required' })}
              className={errors.patientName ? 'border-red-500' : ''}
              placeholder="John Doe"
            />
            {errors.patientName && (
              <p className="text-sm text-red-600 mt-1">{errors.patientName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="maxUses">Maximum Uses</Label>
            <Select 
              onValueChange={(value) => setValue('maxUses', parseInt(value))}
              defaultValue="1"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 use (recommended)</SelectItem>
                <SelectItem value="2">2 uses</SelectItem>
                <SelectItem value="3">3 uses</SelectItem>
                <SelectItem value="5">5 uses</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              Number of times this link can be used by the patient
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this patient link..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={creating || availablePurchases.length === 0}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Link'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

