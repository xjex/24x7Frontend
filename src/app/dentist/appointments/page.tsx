'use client'

import { useEffect, useState } from 'react'
import { useDentistStore, type Appointment, type CreateAppointmentData } from '@/stores/dentistStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  Clock,
  User,
  Filter,
  Edit,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  FileText
} from 'lucide-react'
import { format, addDays, isWeekend, parseISO } from 'date-fns'

interface RescheduleModalProps {
  appointment: Appointment
  onClose: () => void
  onReschedule: (appointmentId: string, data: Partial<CreateAppointmentData>) => Promise<void>
}

function RescheduleModal({ appointment, onClose, onReschedule }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState(appointment.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateAvailableDates = () => {
    const dates = []
    for (let i = 1; i <= 14; i++) {
      const date = addDays(new Date(), i)
      if (!isWeekend(date)) {
        dates.push(date)
      }
    }
    return dates
  }

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return

    try {
      setIsSubmitting(true)
      await onReschedule(appointment._id, {
        date: selectedDate,
        time: selectedTime,
        notes: notes || undefined
      })
      onClose()
    } catch (error) {
      console.error('Failed to reschedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableDates = generateAvailableDates()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reschedule Appointment</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {appointment.patientId?.name || 'Unknown Patient'} - {appointment.serviceId?.name || 'Unknown Service'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Appointment</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Date: {appointment.date ? format(parseISO(appointment.date), 'EEEE, MMMM d, yyyy') : 'No date'}</div>
                <div>Time: {appointment.time || 'No time'}</div>
                <div>Duration: {appointment.duration || 0} minutes</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                New Date
              </Label>
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                    className={`p-2 text-center border rounded-lg transition-colors ${
                      selectedDate === format(date, 'yyyy-MM-dd')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                    <div className="font-medium">{format(date, 'd')}</div>
                    <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  New Time
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 text-center border rounded-lg transition-colors ${
                        selectedTime === time
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Update appointment notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedDate || !selectedTime}>
                {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function DentistAppointmentsPage() {
  const { 
    appointments, 
    isLoading, 
    fetchAppointments, 
    updateAppointment,
    updateAppointmentStatus 
  } = useDentistStore()

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    const filters: Record<string, string> = {}
    if (selectedDate) filters.date = selectedDate
    if (selectedStatus) filters.status = selectedStatus
    
    fetchAppointments(filters)
  }, [fetchAppointments, selectedDate, selectedStatus])



  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'no-show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleReschedule = async (appointmentId: string, data: Partial<CreateAppointmentData>) => {
    try {
      await updateAppointment(appointmentId, data)
      setRescheduleAppointment(null)
    } catch (error) {
      console.error('Failed to reschedule:', error)
      throw error
    }
  }

  const todaysAppointments = appointments.filter(apt => {
    try {
      return apt.date && format(parseISO(apt.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    } catch {
      return false
    }
  })

  const upcomingAppointments = appointments.filter(apt => {
    try {
      return apt.date && parseISO(apt.date) > new Date() && apt.status !== 'cancelled'
    } catch {
      return false
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your patient appointments</p>
        </div>
        <Button onClick={() => window.location.href = '/dentist/schedule'} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          New Appointment
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
                  {todaysAppointments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Today&apos;s Appointments</div>
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
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {appointments.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Appointments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Filter by Date</Label>
              <Input
                id="dateFilter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Filter by Status</Label>
              <select
                id="statusFilter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>

            {(selectedDate || selectedStatus) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDate('')
                    setSelectedStatus('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Schedule</CardTitle>
          <CardDescription>
            View and manage your patient appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                {selectedDate || selectedStatus 
                  ? 'Try adjusting your filters or schedule a new appointment' 
                  : 'Get started by scheduling your first appointment'
                }
              </p>
              <Button onClick={() => window.location.href = '/dentist/schedule'}>
                Schedule Appointment
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
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {(appointment.patientId?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {appointment.patientId?.name || 'Unknown Patient'}
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
                            {appointment.time} ({appointment.duration}min)
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {appointment.serviceId?.name || 'Unknown Service'}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {appointment.patientId?.email || 'No email'}
                          </div>
                          
                          {appointment.patientId?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.patientId.phone}
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
                      {appointment.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRescheduleAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {appointment.status === 'confirmed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appointment._id, 'completed')}
                            className="text-green-600 hover:text-green-700"
                          >
                            Complete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRescheduleAppointment(appointment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(appointment._id, 'no-show')}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            No Show
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {rescheduleAppointment && (
        <RescheduleModal
          appointment={rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  )
}