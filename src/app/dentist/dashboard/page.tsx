'use client'

import { useEffect, useState } from 'react'
import { useDentistStore, type Appointment } from '@/stores/dentistStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Plus,
  Stethoscope,
  FileText
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import Link from 'next/link'

interface AppointmentCardProps {
  appointment: Appointment
  onStatusUpdate: (id: string, status: Appointment['status']) => void
}

function AppointmentCard({ appointment, onStatusUpdate }: AppointmentCardProps) {
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300'
      case 'pending': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300'
      case 'completed': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300'
      case 'cancelled': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-300'
      case 'no-show': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    try {
      const date = parseISO(dateString)
      if (isToday(date)) return 'Today'
      if (isTomorrow(date)) return 'Tomorrow'
      return format(date, 'MMM d')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{appointment.patientId?.name || 'Unknown Patient'}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.serviceId?.name || 'Unknown Service'}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(appointment.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {appointment.time || 'No time'}
          </span>
        </div>
        
        {appointment.status === 'pending' && (
          <div className="flex gap-1">
            <button 
              onClick={() => onStatusUpdate(appointment._id, 'confirmed')}
              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onStatusUpdate(appointment._id, 'cancelled')}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DentistDashboard() {
  const { 
    appointments, 
    patients, 
    services,
    isLoading, 
    fetchAppointments,
    fetchPatients,
    fetchMyServices,
    updateAppointmentStatus 
  } = useDentistStore()
  
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    todaysAppointments: 0,
    totalServices: 0,
    completionRate: 0
  })

  useEffect(() => {
    fetchAppointments()
    fetchPatients()
    fetchMyServices()
  }, [fetchAppointments, fetchPatients, fetchMyServices])

  useEffect(() => {
    if (appointments?.length > 0) {
      const today = format(new Date(), 'yyyy-MM-dd')
      const todays = appointments.filter((apt: Appointment) => {
        try {
          return apt.date && format(parseISO(apt.date), 'yyyy-MM-dd') === today
        } catch {
          return false
        }
      })
      
      const upcoming = appointments.filter((apt: Appointment) => {
        try {
          return apt.date && new Date(apt.date) > new Date() && apt.status !== 'cancelled'
        } catch {
          return false
        }
      }).slice(0, 5)
      
      setTodaysAppointments(todays)
      setUpcomingAppointments(upcoming)
      
      // Calculate stats
      const totalPatients = patients.length
      const completed = appointments.filter((apt: Appointment) => apt.status === 'completed').length
      const completionRate = appointments.length > 0 ? (completed / appointments.length) * 100 : 0
      
      setStats({
        totalPatients,
        todaysAppointments: todays.length,
        totalServices: services.length,
        completionRate: Math.round(completionRate)
      })
    }
  }, [appointments, patients, services])

  const handleStatusUpdate = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appointmentId, status)
    } catch (error) {
      console.error('Failed to update appointment status:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your dentist dashboard</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today&apos;s Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todaysAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Services</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalServices}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Schedule
              </CardTitle>
              <Link href="/dentist/schedule">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your appointments for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
              </div>
            ) : todaysAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.filter(apt => apt && apt._id).map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <Link href="/dentist/appointments">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your next scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.filter(apt => apt && apt._id).map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access frequently used features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dentist/schedule">
              <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group cursor-pointer">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    Schedule Appointment
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create new appointment</p>
                </div>
              </div>
            </Link>

            <Link href="/dentist/patients">
              <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group cursor-pointer">
                <div className="text-center">
                  <Users className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300">
                    View Patients
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage patient records</p>
                </div>
              </div>
            </Link>

            <Link href="/dentist/services">
              <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group cursor-pointer">
                <div className="text-center">
                  <Stethoscope className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    My Services
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">View offered services</p>
                </div>
              </div>
            </Link>

            <Link href="/dentist/profile">
              <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group cursor-pointer">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300">
                    Profile Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile</p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}