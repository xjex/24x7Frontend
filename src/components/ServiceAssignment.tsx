'use client'

import { useEffect, useState } from 'react'
import { useServiceStore, type ServiceAssignmentData } from '@/stores/serviceStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  X,
  Plus,
  Trash2,
  Settings,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react'

interface ServiceAssignmentProps {
  dentistId: string
  dentistName: string
  onClose: () => void
}

export default function ServiceAssignment({ dentistId, dentistName, onClose }: ServiceAssignmentProps) {
  const { 
    services,
    dentistServices,
    isLoading,
    fetchServices,
    fetchDentistServices,
    assignServiceToDentist,
    removeServiceFromDentist
  } = useServiceStore()

  const [showAssignForm, setShowAssignForm] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customDuration, setCustomDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchServices()
    fetchDentistServices(dentistId)
  }, [fetchServices, fetchDentistServices, dentistId])

  const assignedServiceIds = dentistServices.map(ds => ds.serviceId._id)
  const availableServices = services.filter(service => !assignedServiceIds.includes(service._id))

  const handleAssignService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceId) return

    try {
      setIsSubmitting(true)
      const assignmentData: ServiceAssignmentData = {
        dentistId,
        serviceId: selectedServiceId,
        customPrice: customPrice ? parseFloat(customPrice) : undefined,
        customDuration: customDuration ? parseInt(customDuration) : undefined,
        notes: notes || undefined
      }

      await assignServiceToDentist(assignmentData)
      
      // Reset form
      setSelectedServiceId('')
      setCustomPrice('')
      setCustomDuration('')
      setNotes('')
      setShowAssignForm(false)
      
      // Refresh dentist services
      await fetchDentistServices(dentistId)
    } catch (error) {
      console.error('Failed to assign service:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveService = async (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to remove "${serviceName}" from ${dentistName}?`)) {
      try {
        await removeServiceFromDentist(dentistId, serviceId)
        await fetchDentistServices(dentistId)
      } catch (error) {
        console.error('Failed to remove service:', error)
      }
    }
  }

  const selectedService = services.find(s => s._id === selectedServiceId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Service Assignment for Dr. {dentistName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage services offered by this dentist
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Assign New Service */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign New Service
                </h3>
                {!showAssignForm && availableServices.length > 0 && (
                  <Button onClick={() => setShowAssignForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                )}
              </div>

              {showAssignForm && (
                <form onSubmit={handleAssignService} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">Select Service</Label>
                      <select
                        id="service"
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="">Choose a service...</option>
                        {availableServices.map(service => (
                          <option key={service._id} value={service._id}>
                            {service.name} ({service.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedService && (
                      <div className="space-y-2">
                        <Label>Default Settings</Label>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div>Duration: {selectedService.defaultDuration} minutes</div>
                          <div>Price: ${selectedService.defaultPrice}</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="customPrice">Custom Price ($)</Label>
                      <Input
                        id="customPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        placeholder={selectedService ? selectedService.defaultPrice.toString() : "0.00"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customDuration">Custom Duration (minutes)</Label>
                      <Input
                        id="customDuration"
                        type="number"
                        min="15"
                        max="480"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder={selectedService ? selectedService.defaultDuration.toString() : "30"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special notes about this service for this dentist..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowAssignForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !selectedServiceId}>
                      {isSubmitting ? 'Assigning...' : 'Assign Service'}
                    </Button>
                  </div>
                </form>
              )}

              {availableServices.length === 0 && !showAssignForm && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  All available services have been assigned to this dentist.
                </p>
              )}
            </div>

            {/* Current Services */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Services ({dentistServices.length})
              </h3>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-gray-600 dark:text-gray-400">Loading services...</div>
                </div>
              ) : dentistServices.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No services assigned yet. Add some services to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dentistServices.map((dentistService) => (
                    <div
                      key={dentistService._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {dentistService.serviceId.name}
                            </h4>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {dentistService.serviceId.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {dentistService.customDuration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${dentistService.customPrice}
                            </div>
                          </div>

                          {dentistService.notes && (
                            <div className="flex items-start gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <FileText className="h-3 w-3 mt-0.5" />
                              <span>{dentistService.notes}</span>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveService(dentistService.serviceId._id, dentistService.serviceId.name)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}