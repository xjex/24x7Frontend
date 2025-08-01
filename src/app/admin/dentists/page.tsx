'use client'

import { useEffect, useState } from 'react'
import { useAdminStore, DentistFormData, DentistUpdateData, AdminUser } from '@/stores/adminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DentistForm from '@/components/DentistForm'
import ServiceAssignment from '@/components/ServiceAssignment'
import { 
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Settings
} from 'lucide-react'

export default function DentistManagementPage() {
  const { 
    dentists, 
    isLoading, 
    fetchDentists, 
    createDentist,
    updateDentist,
    deleteDentist
  } = useAdminStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showDentistForm, setShowDentistForm] = useState(false)
  const [editingDentist, setEditingDentist] = useState<AdminUser | null>(null)
  const [showServiceAssignment, setShowServiceAssignment] = useState(false)
  const [selectedDentistForServices, setSelectedDentistForServices] = useState<AdminUser | null>(null)

  useEffect(() => {
    fetchDentists()
  }, [fetchDentists])

  const handleCreateDentist = async (data: DentistFormData) => {
    try {
      await createDentist(data)
      setShowDentistForm(false)
    } catch (error) {
      console.error('Failed to create dentist:', error)
      throw error
    }
  }

  const handleUpdateDentist = async (data: DentistUpdateData) => {
    if (!editingDentist) return
    try {
      await updateDentist(editingDentist._id, data)
      setEditingDentist(null)
      setShowDentistForm(false)
    } catch (error) {
      console.error('Failed to update dentist:', error)
      throw error
    }
  }

  const handleDeleteDentist = async (dentistId: string, dentistName: string) => {
    if (window.confirm(`Are you sure you want to delete dentist "${dentistName}"? This action cannot be undone.`)) {
      try {
        await deleteDentist(dentistId)
      } catch (error) {
        console.error('Failed to delete dentist:', error)
      }
    }
  }

  const handleEditDentist = (dentist: AdminUser) => {
    setEditingDentist(dentist)
    setShowDentistForm(true)
  }

  const handleCancelForm = () => {
    setShowDentistForm(false)
    setEditingDentist(null)
  }

  const handleManageServices = (dentist: AdminUser) => {
    setSelectedDentistForServices(dentist)
    setShowServiceAssignment(true)
  }

  const handleCloseServiceAssignment = () => {
    setShowServiceAssignment(false)
    setSelectedDentistForServices(null)
  }

  const filteredDentists = dentists.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch && user.role === 'dentist'
  })

  if (showDentistForm) {
    return (
      <div className="space-y-6">
        <DentistForm
          initialData={editingDentist ? {
            name: editingDentist.name,
            email: editingDentist.email,
            licenseNumber: editingDentist.profile?.licenseNumber,
            specialization: editingDentist.profile?.specialization,
            experience: editingDentist.profile?.experience,
            consultationFee: editingDentist.profile?.consultationFee,
            bio: editingDentist.profile?.bio,
            education: editingDentist.profile?.education
          } : undefined}
          onSubmit={editingDentist ? 
            (data: DentistFormData | DentistUpdateData) => handleUpdateDentist(data as DentistUpdateData) : 
            (data: DentistFormData | DentistUpdateData) => handleCreateDentist(data as DentistFormData)
          }
          onCancel={handleCancelForm}
          isEdit={!!editingDentist}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dentist Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage dentist profiles and credentials</p>
          </div>
          <Button onClick={() => setShowDentistForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Dentist
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search dentists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">Loading dentists...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Dentist</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">License</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Specialization</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Experience</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Status</th>
                  <th className="text-right py-3 px-2 text-gray-900 dark:text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDentists.map((dentist) => (
                  <tr key={dentist._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {dentist.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{dentist.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      {dentist.profile?.licenseNumber || 'N/A'}
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      {dentist.profile?.specialization?.slice(0, 2).join(', ') || 'N/A'}
                      {(dentist.profile?.specialization?.length || 0) > 2 && '...'}
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      {dentist.profile?.experience ? `${dentist.profile.experience} years` : 'N/A'}
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        dentist.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {dentist.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageServices(dentist)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          title="Manage Services"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDentist(dentist)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDentist(dentist._id, dentist.name)}
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
            
            {filteredDentists.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No dentists found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showServiceAssignment && selectedDentistForServices && (
        <ServiceAssignment
          dentistId={selectedDentistForServices._id}
          dentistName={selectedDentistForServices.name}
          onClose={handleCloseServiceAssignment}
        />
      )}
    </div>
  )
}