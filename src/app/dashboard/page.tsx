'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore, type Appointment } from '@/stores/patientStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  CalendarDays,
  Stethoscope,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { 
    appointments, 
    upcomingAppointments, 
    fetchAppointments, 
    fetchProfile,
    cancelAppointment, 
    isLoading 
  } = usePatientStore()

  const [stats, setStats] = useState<{
    totalAppointments: number
    upcomingAppointments: number
    completedAppointments: number
    nextAppointment: Appointment | null
  }>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    nextAppointment: null
  })

  useEffect(() => {
    fetchAppointments()
    fetchProfile()
  }, [fetchAppointments, fetchProfile])

  useEffect(() => {
    if (appointments.length > 0) {
      const completed = appointments.filter(apt => apt.status === 'completed').length
      const nextApt = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
      
      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: completed,
        nextAppointment: nextApt
      })
    }
  }, [appointments, upcomingAppointments])

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId)
      } catch (error) {
        console.error('Failed to cancel appointment:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'no-show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    try {
      const date = parseISO(dateString)
      if (isToday(date)) return 'Today'
      if (isTomorrow(date)) return 'Tomorrow'
      return format(date, 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here&apos;s your dental care overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              All time appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Finished treatments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Visit</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.nextAppointment ? formatDate(stats.nextAppointment.date) : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.nextAppointment ? stats.nextAppointment.time : 'No upcoming appointments'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Book
            </CardTitle>
            <CardDescription>
              Schedule your next dental appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
                            <Link href="/book">
              <Button className="w-full">
                Book Appointment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Appointments
            </CardTitle>
            <CardDescription>
              View and manage your appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/appointments">
              <Button variant="outline" className="w-full">
                View Appointments
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile">
              <Button variant="outline" className="w-full">
                Edit Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Appointments
              </span>
              <Link href="/dashboard/appointments">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Your next scheduled visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-muted-foreground">Loading appointments...</div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Link href="/book">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            {appointment.dentistId?.name || 'Dr. Unknown'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {appointment.serviceId?.name || 'General Consultation'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.time || 'No time'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your treatment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.filter(apt => apt.status === 'completed').length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No treatment history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter(apt => apt.status === 'completed')
                  .slice(0, 3)
                  .map((appointment) => (
                    <div key={appointment._id} className="border-l-4 border-green-500 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {appointment.serviceId?.name || 'General Consultation'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            with {appointment.dentistId?.name || 'Dr. Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(appointment.date)} at {appointment.time || 'No time'}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}