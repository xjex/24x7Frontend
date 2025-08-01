'use client'

import { useEffect, useState } from 'react'
import { useAdminStore } from '@/stores/adminStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users,
  Search,
  Trash2,
} from 'lucide-react'

export default function PatientManagementPage() {
  const { 
    patients, 
    isLoading, 
    fetchPatients, 
    deleteUser
  } = useAdminStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    if (window.confirm(`Are you sure you want to delete patient "${patientName}"? This action cannot be undone.`)) {
      try {
        await deleteUser(patientId)
      } catch (error) {
        console.error('Failed to delete patient:', error)
      }
    }
  }

  const filteredPatients = patients.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch && user.role === 'patient'
  })

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage patient accounts and profiles</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">Loading patients...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Patient</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Contact</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Address</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Age</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-gray-900 dark:text-white font-medium">Joined</th>
                  <th className="text-right py-3 px-2 text-gray-900 dark:text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      {patient.profile?.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="max-w-32 truncate">
                        {patient.profile?.address || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      {patient.profile?.birthdate 
                        ? Math.floor((new Date().getTime() - new Date(patient.profile.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365))
                        : 'N/A'
                      }
                    </td>
                    <td className="py-4 px-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        patient.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePatient(patient._id, patient.name)}
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
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No patients found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}