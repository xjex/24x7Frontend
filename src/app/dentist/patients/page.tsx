'use client'

import { useEffect, useState } from 'react'
import { useDentistStore, type Patient } from '@/stores/dentistStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Plus,
  Eye,
  Clock
} from 'lucide-react'

interface CreateAppointmentModalProps {
  patient: Patient
  onClose: () => void
  onSchedule: (patientId: string) => void
}

function CreateAppointmentModal({ patient, onClose, onSchedule }: CreateAppointmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Schedule Appointment
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 dark:text-white">{patient.name || 'Unknown Patient'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{patient.email || 'No email'}</p>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You will be redirected to the scheduling page to create an appointment for this patient.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onSchedule(patient._id)}>
              Continue to Schedule
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DentistPatientsPage() {
  const { patients, isLoading, fetchPatients } = useDentistStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const filteredPatients = patients.filter(patient => {
    if (!patient) return false
    
    const matchesSearch = 
      (patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSearch
  })

  const handleScheduleAppointment = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowScheduleModal(true)
  }

  const handleProceedToSchedule = (patientId: string) => {
    setShowScheduleModal(false)
    setSelectedPatient(null)
    // Navigate to schedule page with patient pre-selected
    window.location.href = `/dentist/schedule?patientId=${patientId}`
  }

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthdate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    
    return age
  }

  const formatLastVisit = (lastVisit: string) => {
    if (!lastVisit) return 'Never'
    return new Date(lastVisit).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your patient list</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Users className="h-4 w-4" />
          {filteredPatients.length} patients
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            Search and view detailed information about your patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-gray-600 dark:text-gray-400">Loading patients...</div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No patients found' : 'No patients yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? 'Try adjusting your search criteria' 
                    : 'Patients will appear here when they book appointments with you'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                          {(patient.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {patient.name || 'Unknown Patient'}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Age: {calculateAge(patient.profile?.birthdate || patient.birthdate || '')}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email || 'No email'}
                            </div>
                            
                            {(patient.profile?.phone || patient.phone) && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.profile?.phone || patient.phone}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last visit: {formatLastVisit(patient.lastVisit || '')}
                            </div>
                          </div>
                          
                          {(patient.profile?.address || patient.address) && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-3 w-3" />
                              <span className="max-w-md truncate">
                                {patient.profile?.address || patient.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {patient.totalAppointments || 0} visits
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Since {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleAppointment(patient)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View History
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showScheduleModal && selectedPatient && (
        <CreateAppointmentModal
          patient={selectedPatient}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleProceedToSchedule}
        />
      )}
    </div>
  )
}