'use client'

import { useEffect, useState } from 'react'
import { useServiceStore, type Service, type ServiceFormData, type ServiceUpdateData } from '@/stores/serviceStore'
import { useAdminStore } from '@/stores/adminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const serviceCategories = [
  'Preventive',
  'Restorative', 
  'Cosmetic',
  'Orthodontic',
  'Surgical',
  'Emergency',
  'Consultation'
]

interface ServiceFormProps {
  initialData?: ServiceFormData & { _id?: string; isActive?: boolean }
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

function ServiceForm({ initialData, onSubmit, onCancel, isEdit = false }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Preventive',
    defaultDuration: initialData?.defaultDuration || 30,
    defaultPrice: initialData?.defaultPrice || 100
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Service' : 'Create New Service'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {isEdit ? 'Update service information' : 'Add a new service to the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter service name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
            <Input
              id="defaultDuration"
              type="number"
              min="15"
              max="480"
              value={formData.defaultDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultDuration: parseInt(e.target.value) }))}
              placeholder="30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPrice">Default Price ($)</Label>
            <Input
              id="defaultPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.defaultPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultPrice: parseFloat(e.target.value) }))}
              placeholder="100.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter service description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Service' : 'Create Service')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ServiceManagementPage() {
  const { 
    services, 
    isLoading, 
    fetchServices, 
    createService,
    updateService,
    deleteService
  } = useServiceStore()
  
  const { fetchDentists } = useAdminStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
    fetchDentists()
  }, [fetchServices, fetchDentists])

  const handleCreateService = async (data: ServiceFormData) => {
    try {
      await createService(data)
      setShowServiceForm(false)
    } catch (error) {
      console.error('Failed to create service:', error)
      throw error
    }
  }

  const handleUpdateService = async (data: ServiceUpdateData) => {
    if (!editingService) return
    try {
      await updateService(editingService._id, data)
      setEditingService(null)
      setShowServiceForm(false)
    } catch (error) {
      console.error('Failed to update service:', error)
      throw error
    }
  }

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to delete service "${serviceName}"? This action cannot be undone.`)) {
      try {
        await deleteService(serviceId)
      } catch (error) {
        console.error('Failed to delete service:', error)
      }
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setShowServiceForm(true)
  }

  const handleCancelForm = () => {
    setShowServiceForm(false)
    setEditingService(null)
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'Preventive': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Restorative': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Cosmetic': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Orthodontic': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Surgical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Emergency': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Consultation': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[category as keyof typeof colors] || colors['Consultation']
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Service Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage dental services</p>
        </div>
        {!showServiceForm && (
          <Button onClick={() => setShowServiceForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Service
          </Button>
        )}
      </div>

      {showServiceForm && (
        <ServiceForm
          initialData={editingService || undefined}
          onSubmit={editingService ? handleUpdateService : handleCreateService}
          onCancel={handleCancelForm}
          isEdit={!!editingService}
        />
      )}

      {!showServiceForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {serviceCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading services...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Service</th>
                    <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Category</th>
                    <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Duration</th>
                    <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Price</th>
                    <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Status</th>
                    <th className="text-right py-3 px-2 text-gray-900 dark:text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-2">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {service.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {service.description.length > 50 
                              ? `${service.description.substring(0, 50)}...` 
                              : service.description
                            }
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.defaultDuration} min
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {service.defaultPrice}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        {service.isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteService(service._id, service.name)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No services found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria or create a new service.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}