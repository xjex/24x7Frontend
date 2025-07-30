'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Calendar, Clock, User, Phone, Mail, MapPin, Plus, Edit, Trash2, LogOut } from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { appointments, fetchAppointments, cancelAppointment, isLoading } = useAppointmentStore()
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchAppointments()
  }, [isAuthenticated, fetchAppointments, router])

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointmentId)
      } catch (error) {
        console.error('Failed to cancel appointment:', error)
      }
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const upcomingAppointments = (appointments || []).filter(apt => 
    apt.status === 'scheduled' && new Date(apt.date) >= new Date()
  )
  
  const pastAppointments = (appointments || []).filter(apt => 
    apt.status === 'completed' || new Date(apt.date) < new Date()
  )

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen page-background">
      <header className="gradient-bg-primary shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xl sm:text-2xl font-bold text-white">DentalCare+</div>
              <span className="text-white/70 hidden sm:inline">|</span>
              <span className="text-white/90 font-medium text-sm sm:text-base hidden sm:inline">Patient Dashboard</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-white/90 font-medium text-sm sm:text-base order-2 sm:order-1">
                Welcome, {user.firstName}
              </span>
              <div className="flex items-center gap-3 order-1 sm:order-2">
                <ThemeToggle />
                <Button variant="outline" onClick={handleLogout} className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-gray-900 text-sm sm:text-base px-3 sm:px-4">
                  <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="flex flex-col gap-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">My Appointments</h1>
                <p className="text-base sm:text-lg text-muted-foreground">Manage your dental appointments and health records</p>
              </div>
              <Link href="/book" className="w-full sm:w-auto sm:self-start">
                <Button variant="dental" className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-500 mx-auto mb-4"></div>
                <div className="text-muted-foreground text-lg">Loading appointments...</div>
              </div>
            ) : (
              <>
                <section>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Upcoming Appointments</h2>
                  {upcomingAppointments.length === 0 ? (
                    <div className="pretty-card p-6 sm:p-12 text-center">
                      <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-dental-400 mx-auto mb-4 sm:mb-6" />
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">No upcoming appointments</h3>
                      <p className="text-muted-foreground mb-4 sm:mb-6 text-base sm:text-lg">Start your journey to better dental health</p>
                      <Link href="/book">
                        <Button variant="dental" className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg">Schedule Your First Appointment</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="pretty-card p-4 sm:p-8">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                                {appointment.service}
                              </h3>
                              <p className="text-sm sm:text-lg text-muted-foreground">
                                Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                              </p>
                              <p className="text-xs sm:text-base text-muted-foreground sm:hidden">
                                {appointment.dentist?.specialization}
                              </p>
                              <p className="hidden sm:block text-lg text-muted-foreground">
                                {appointment.dentist?.specialization}
                              </p>
                            </div>
                            <span className={`px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-full self-start ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-dental-500" />
                              <span className="font-medium text-sm sm:text-base">{format(new Date(appointment.date), 'EEE, MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 text-muted-foreground">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-dental-500" />
                              <span className="font-medium text-sm sm:text-base">{appointment.time}</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                              <p className="text-foreground text-sm sm:text-base">
                                <strong className="text-dental-600">Notes:</strong> {appointment.notes}
                              </p>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Link href={`/appointments/${appointment.id}/reschedule`} className="flex-1 sm:flex-none">
                              <Button variant="outline" className="w-full sm:w-auto bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-sm sm:text-base">
                                <Edit className="h-4 w-4 mr-2" />
                                Reschedule
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="w-full sm:w-auto bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm sm:text-base"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {pastAppointments.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-foreground mb-6">Appointment History</h2>
                    <div className="space-y-4">
                      {pastAppointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="pretty-card p-6 opacity-90">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground">{appointment.service}</h3>
                              <p className="text-muted-foreground">
                                Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span>{format(new Date(appointment.date), 'MMM d, yyyy')}</span>
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>

          <div className="space-y-6 lg:space-y-8">
            <div className="pretty-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-dental-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Profile Information</h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-dental-500 flex-shrink-0" />
                  <span className="text-foreground text-sm sm:text-base break-all">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-dental-500 flex-shrink-0" />
                  <span className="text-foreground text-sm sm:text-base">{user.phone || 'Not provided'}</span>
                </div>
                {user.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-dental-500 mt-0.5 flex-shrink-0" />
                    <div className="text-foreground text-sm sm:text-base">
                      <div>{user.address.street}</div>
                      <div>{user.address.city}, {user.address.state} {user.address.zipCode}</div>
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4 sm:mt-6 bg-dental-50 border-dental-200 text-dental-700 hover:bg-dental-100 text-sm sm:text-base py-2 sm:py-3">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="pretty-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Emergency Contact</h2>
              {user.emergencyContact ? (
                <div className="space-y-3">
                  <div className="text-base sm:text-lg font-semibold text-foreground">{user.emergencyContact.name}</div>
                  <div className="text-sm sm:text-base text-muted-foreground">{user.emergencyContact.relationship}</div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-dental-500 flex-shrink-0" />
                    <span className="text-foreground text-sm sm:text-base">{user.emergencyContact.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm sm:text-base">No emergency contact on file</p>
              )}
            </div>

            <div className="pretty-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Quick Actions</h2>
              <div className="space-y-3 sm:space-y-4">
                <Link href="/book">
                  <Button variant="outline" className="w-full py-3 sm:py-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-sm sm:text-base">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Book Appointment
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full py-3 sm:py-4 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 text-sm sm:text-base">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Contact Office
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 