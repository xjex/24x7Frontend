'use client'

import { useEffect, useState } from 'react'
import { usePatientStore, type Appointment } from '@/stores/patientStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, Clock, User, Mail, CheckCircle, Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'



const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export default function AppointmentsPage() {
  const { 
    appointments, 
    isLoading: loading, 
    fetchAppointments, 
    cancelAppointment, 
    rescheduleAppointment,
    fetchDentists, 
    fetchServices 
  } = usePatientStore()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ time24: string; time12: string } | null>(null)
  const [isRescheduling, setIsRescheduling] = useState(false)

  useEffect(() => {
    fetchAppointments()
    fetchDentists()
    fetchServices()
  }, [fetchAppointments, fetchDentists, fetchServices])

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId)
      await cancelAppointment(appointmentId)
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const canCancelAppointment = (status: string, date: string) => {
    const appointmentDate = new Date(date)
    const now = new Date()
    const timeDiff = appointmentDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    
    return status === 'pending' || (status === 'confirmed' && hoursDiff > 24)
  }

  const canRescheduleAppointment = (status: string, date: string) => {
    const appointmentDate = new Date(date)
    const now = new Date()
    const timeDiff = appointmentDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    
    return status === 'pending' || (status === 'confirmed' && hoursDiff > 24)
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTimeSlot) return

    try {
      setIsRescheduling(true)
      const dateString = format(selectedDate, 'yyyy-MM-dd')
      await rescheduleAppointment(selectedAppointment._id, dateString, selectedTimeSlot.time24)
      setRescheduleModalOpen(false)
      setSelectedAppointment(null)
      setSelectedDate(undefined)
      setSelectedTimeSlot(null)
      await fetchAppointments()
    } catch (error) {
      console.error('Failed to reschedule appointment:', error)
    } finally {
      setIsRescheduling(false)
    }
  }

  const openRescheduleModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleModalOpen(true)
  }

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
  )
  


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your dental appointments</p>
        </div>
        <Button onClick={() => window.location.href = '/book'} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {upcomingAppointments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {appointments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
          <CardDescription>
            Your past and upcoming dental appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading appointments...</div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No appointments found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You haven&apos;t booked any appointments yet. Get started by scheduling your first appointment.
              </p>
              <Button onClick={() => window.location.href = '/book'}>
                Book Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-medium">
                        {(appointment.dentistId?.name || 'D').charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            Dr. {appointment.dentistId?.name || 'Unknown Dentist'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {appointment.date ? format(parseISO(appointment.date), 'MMM d, yyyy') : 'No date'}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {appointment.serviceId?.name || 'Unknown Service'}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {appointment.dentistId?.email || 'No email'}
                          </div>
                          
                          {appointment.serviceId?.category && (
                            <div className="flex items-center gap-1">
                              <span className="h-3 w-3 text-center">•</span>
                              {appointment.serviceId.category}
                            </div>
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canRescheduleAppointment(appointment.status, appointment.date) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRescheduleModal(appointment)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Reschedule
                        </Button>
                      )}
                      {canCancelAppointment(appointment.status, appointment.date) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment._id)}
                          disabled={cancellingId === appointment._id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for your appointment with Dr. {selectedAppointment?.dentistId?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Current Appointment Details */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="font-medium mb-2 text-sm">Current Appointment</h4>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p><strong>Date:</strong> {format(parseISO(selectedAppointment.date), 'MMM d, yyyy')}</p>
                  <p><strong>Time:</strong> {selectedAppointment.time}</p>
                  <p><strong>Service:</strong> {selectedAppointment.serviceId?.name}</p>
                </div>
              </div>

              {/* New Date & Time Selection */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Select New Date & Time</h4>
                <div className="max-h-96 overflow-y-auto">
                  <AppointmentCalendar
                    dentistId={selectedAppointment.dentistId._id}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onTimeSelect={(timeSlot) => setSelectedTimeSlot(timeSlot)}
                  />
                </div>
              </div>

              {/* Selected Time Display */}
              {selectedDate && selectedTimeSlot && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-1">New Appointment</h5>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                    <p><strong>Time:</strong> {selectedTimeSlot.time12}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRescheduleModalOpen(false)
                    setSelectedAppointment(null)
                    setSelectedDate(undefined)
                    setSelectedTimeSlot(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRescheduleAppointment}
                  disabled={!selectedDate || !selectedTimeSlot || isRescheduling}
                >
                  {isRescheduling ? 'Rescheduling...' : 'Reschedule'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}