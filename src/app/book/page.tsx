'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { usePatientStore } from '@/stores/patientStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  User, 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  UserPlus,
  LogIn,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'


interface GuestBookingData {
  dentistId: string
  serviceId: string
  date: Date
  timeSlot: { time24: string; time12: string }
  notes: string
}

interface GuestUserData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  birthdate: string
  gender: string
  address: string
}

export default function PublicBookingPage() {
  const { user, isAuthenticated, login, register: authRegister } = useAuthStore()
  const { 
    dentists, 
    services, 
    fetchDentists, 
    fetchServices, 
    bookAppointment,
    isBooking
  } = usePatientStore()

  const [step, setStep] = useState(1)
  const [selectedDentist, setSelectedDentist] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ time24: string; time12: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'choice'>('choice')
  const [guestBookingData, setGuestBookingData] = useState<GuestBookingData | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showBookingLoader, setShowBookingLoader] = useState(false)
  const [guestData, setGuestData] = useState<GuestUserData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    gender: '',
    address: ''
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const selectedDentistData = dentists.find(d => d._id === selectedDentist)
  const selectedServiceData = services.find(s => s._id === selectedService)

  useEffect(() => {
    fetchDentists()
    fetchServices()
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      console.log('Found success parameter, showing thank you page')
      setStep(5)
      window.history.replaceState({}, document.title, '/book')
      return
    }
    const savedStep = localStorage.getItem('bookingStep')
    if (savedStep === '5') {
      console.log('Found saved step 5, showing thank you page')
      setStep(5)
      localStorage.removeItem('bookingStep')
      return
    }
    const pendingBooking = sessionStorage.getItem('pendingBooking')
    const savedGuestData = sessionStorage.getItem('guestUserData')
    
    if (pendingBooking && !guestBookingData) {
      try {
        const bookingData = JSON.parse(pendingBooking)
        console.log('Found pending booking data, restoring...')
        setGuestBookingData(bookingData)
        setSelectedDentist(bookingData.dentistId)
        setSelectedService(bookingData.serviceId)
        setSelectedDate(bookingData.date)
        setSelectedTimeSlot(bookingData.timeSlot)
        setNotes(bookingData.notes)
        setStep(3)
        
        if (savedGuestData) {
          try {
            const userData = JSON.parse(savedGuestData)
            setGuestData(userData)
            console.log('Restored guest user data')
          } catch (error) {
            console.error('Failed to restore guest user data:', error)
          }
        }
        
        if (isAuthenticated && user) {
          console.log('User already authenticated, checking if should auto-book...')
          
          // Check if there's an active booking attempt to prevent double booking
          const activeBookingId = sessionStorage.getItem('activeBookingAttempt')
          if (activeBookingId) {
            console.log('Active booking attempt detected, skipping auto-book:', activeBookingId)
            return
          }
          
          // Only auto-book if we're not currently in an auth flow
          if (!isAuthenticating && !showBookingLoader) {
            setTimeout(async () => {
              try {
                setShowBookingLoader(true)
                
                // Verify token is available
                const token = localStorage.getItem('token')
                console.log('Auto-booking token check:', !!token)
                
                if (!token) {
                  throw new Error('Authentication token not found for auto-booking.')
                }
                
                const dateString = format(bookingData.date, 'yyyy-MM-dd')
                console.log('Auto-booking attempt:', { dentistId: bookingData.dentistId, serviceId: bookingData.serviceId, date: dateString, time: bookingData.timeSlot.time24, notes: bookingData.notes })
                
                await bookAppointment({
                  dentistId: bookingData.dentistId,
                  serviceId: bookingData.serviceId,
                  date: dateString,
                  time: bookingData.timeSlot.time24,
                  notes: bookingData.notes
                })
                console.log('Automatic booking successful!')
                sessionStorage.removeItem('pendingBooking')
                sessionStorage.removeItem('guestUserData')
                sessionStorage.removeItem('activeBookingAttempt')
                
                const thankYouData = {
                  dentist: selectedDentistData?.name || 'Unknown',
                  service: selectedServiceData?.name || 'Unknown',
                  date: format(bookingData.date, 'MMMM d, yyyy'),
                  time: bookingData.timeSlot.time12,
                  notes: bookingData.notes
                }
                localStorage.setItem('thankYouData', JSON.stringify(thankYouData))
                setShowBookingLoader(false)
                setStep(5)
              } catch (error) {
                console.error('Automatic booking failed:', error)
                setShowBookingLoader(false)
                sessionStorage.removeItem('activeBookingAttempt')
                setMessage({ type: 'error', text: 'Please confirm your booking details and try again.' })
              }
            }, 1000)
          } else {
            console.log('Skipping auto-booking - already in auth/booking flow')
          }
        } else {
          setShowAuthModal(true)
        }
      } catch (error) {
        console.error('Failed to restore booking data:', error)
        sessionStorage.removeItem('pendingBooking')
        sessionStorage.removeItem('guestUserData')
        sessionStorage.removeItem('activeBookingAttempt')
      }
    }
  }, [fetchDentists, fetchServices, guestBookingData, bookAppointment, isAuthenticated, isAuthenticating, selectedDentistData?.name, selectedServiceData?.name, showBookingLoader, user])
  const validatePassword = (password: string) => {
    const minLength = password.length >= 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
      errors: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber
      }
    }
  }

  const passwordsMatch = guestData.password === guestData.confirmPassword

  const canProceedToStep2 = selectedService && selectedDentist
  const canProceedToStep3 = canProceedToStep2 && selectedDate && selectedTimeSlot
  const canProceedToStep4 = canProceedToStep3

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return canProceedToStep2
      case 2:
        return canProceedToStep3
      case 3:
        return canProceedToStep4
      default:
        return false
    }
  }

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedDentist || !selectedService) return
    if (showBookingLoader || isBooking) return
    
    if (isAuthenticated && user) {
      try {
        setShowBookingLoader(true)
        const dateString = format(selectedDate, 'yyyy-MM-dd')
        console.log('Booking appointment:', { dentistId: selectedDentist, serviceId: selectedService, date: dateString, time: selectedTimeSlot.time24, notes })
        await bookAppointment({
          dentistId: selectedDentist,
          serviceId: selectedService,
          date: dateString,
          time: selectedTimeSlot.time24,
          notes
        })
        
        const thankYouData = {
          dentist: selectedDentistData?.name || 'Unknown',
          service: selectedServiceData?.name || 'Unknown',
          date: format(selectedDate, 'MMMM d, yyyy'),
          time: selectedTimeSlot.time12,
          notes
        }
        localStorage.setItem('thankYouData', JSON.stringify(thankYouData))
        
        setShowBookingLoader(false)
        setStep(5)
      } catch (error) {
        console.error('Failed to book appointment:', error)
        setShowBookingLoader(false)
        setMessage({ type: 'error', text: 'Failed to book appointment. Please try again.' })
      }
      return
    }
    setGuestBookingData({
      dentistId: selectedDentist,
      serviceId: selectedService,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      notes
    })
    setShowAuthModal(true)
  }

  const handleGuestLogin = async () => {
    if (!guestBookingData) {
      setMessage({ type: 'error', text: 'Booking data not found. Please start over.' })
      return
    }
    
    if (isAuthenticating || showBookingLoader) return

    try {
      setIsAuthenticating(true)
      setMessage(null)
      
      console.log('Starting guest login...')
      
      // Set active booking attempt to prevent race conditions
      const attemptId = `login-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('activeBookingAttempt', attemptId)
      sessionStorage.setItem('pendingBooking', JSON.stringify(guestBookingData))
      
      await login(loginData.email, loginData.password)
      console.log('Login completed, preventing redirect to continue booking')
      
      setShowAuthModal(false)
      await new Promise(resolve => setTimeout(resolve, 500))
      
            try {
        setShowBookingLoader(true)
        console.log('Login successful, now booking appointment...')
        
        // Ensure token is properly set before booking
        await new Promise(resolve => setTimeout(resolve, 100))
        const token = localStorage.getItem('token')
        console.log('Token check before booking:', !!token)
        
        if (!token) {
          throw new Error('Authentication token not found. Please try again.')
        }
        
        const dateString = format(guestBookingData.date, 'yyyy-MM-dd')
        
        console.log('Guest login booking:', { dentistId: guestBookingData.dentistId, serviceId: guestBookingData.serviceId, date: dateString, time: guestBookingData.timeSlot.time24, notes: guestBookingData.notes })
      await bookAppointment({
          dentistId: guestBookingData.dentistId,
          serviceId: guestBookingData.serviceId,
          date: dateString,
          time: guestBookingData.timeSlot.time24,
          notes: guestBookingData.notes
        })
        
        console.log('Booking successful, redirecting to thank you page...')
        sessionStorage.removeItem('pendingBooking')
        sessionStorage.removeItem('activeBookingAttempt')
        
        const thankYouData = {
          dentist: selectedDentistData?.name || 'Unknown',
          service: selectedServiceData?.name || 'Unknown', 
          date: format(guestBookingData.date, 'MMMM d, yyyy'),
          time: guestBookingData.timeSlot.time12,
          notes: guestBookingData.notes
        }
        localStorage.setItem('thankYouData', JSON.stringify(thankYouData))
        setShowBookingLoader(false)
        console.log('Redirecting to success page...')
        window.location.href = '/book?success=true'
        
      } catch (bookingError) {
        console.error('Booking failed after login:', bookingError)
        setShowBookingLoader(false)
        sessionStorage.removeItem('activeBookingAttempt')
        setMessage({ type: 'error', text: 'Login successful, but booking failed. Please try booking again from your dashboard.' })
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 3000)
      }
    } catch (error) {
      console.error('Login failed:', error)
      sessionStorage.removeItem('activeBookingAttempt')
      setMessage({ type: 'error', text: 'Login failed. Please check your credentials.' })
      setIsAuthenticating(false)
    }
  }

  const handleGuestRegister = async () => {
    if (!guestBookingData) {
      setMessage({ type: 'error', text: 'Booking data not found. Please start over.' })
      return
    }
    
    if (isAuthenticating || showBookingLoader) return

    try {
      setIsAuthenticating(true)
      setMessage(null)
      
      console.log('Starting guest registration...')
      
      // Set active booking attempt to prevent race conditions
      const attemptId = `register-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('activeBookingAttempt', attemptId)
      sessionStorage.setItem('pendingBooking', JSON.stringify(guestBookingData))
      sessionStorage.setItem('guestUserData', JSON.stringify(guestData))
      
      await authRegister({
        name: guestData.name,
        email: guestData.email,
        password: guestData.password,
        phone: guestData.phone,
        birthdate: guestData.birthdate,
        gender: guestData.gender,
        address: guestData.address
      })
      
      console.log('Registration completed successfully')
      setShowAuthModal(false)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        setShowBookingLoader(true)
        console.log('Registration successful, now booking appointment...')
        
        // Ensure token is properly set before booking
        await new Promise(resolve => setTimeout(resolve, 100))
        const token = localStorage.getItem('token')
        console.log('Token check before booking:', !!token)
        
        if (!token) {
          throw new Error('Authentication token not found. Please try again.')
        }
        
        const dateString = format(guestBookingData.date, 'yyyy-MM-dd')
        
        console.log('Guest register booking:', { attemptId, dentistId: guestBookingData.dentistId, serviceId: guestBookingData.serviceId, date: dateString, time: guestBookingData.timeSlot.time24, notes: guestBookingData.notes })
        await bookAppointment({
          dentistId: guestBookingData.dentistId,
          serviceId: guestBookingData.serviceId,
          date: dateString,
          time: guestBookingData.timeSlot.time24,
          notes: guestBookingData.notes
        })
        
        console.log('Booking successful, redirecting to thank you page...')
        sessionStorage.removeItem('pendingBooking')
        sessionStorage.removeItem('guestUserData')
        sessionStorage.removeItem('activeBookingAttempt')
        
        const thankYouData = {
          dentist: selectedDentistData?.name || 'Unknown',
          service: selectedServiceData?.name || 'Unknown',
          date: format(guestBookingData.date, 'MMMM d, yyyy'),
          time: guestBookingData.timeSlot.time12,
          notes: guestBookingData.notes
        }
        localStorage.setItem('thankYouData', JSON.stringify(thankYouData))
        setShowBookingLoader(false)
        console.log('Redirecting to success page...')
        window.location.href = '/book?success=true'
        
      } catch (bookingError) {
        console.error('Booking failed after registration:', bookingError)
        setShowBookingLoader(false)
        sessionStorage.removeItem('activeBookingAttempt')
        setMessage({ type: 'error', text: 'Registration successful, but booking failed. Please try booking again from your dashboard.' })
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 3000)
      }
    } catch (error) {
      console.error('Registration failed:', error)
      sessionStorage.removeItem('activeBookingAttempt')
      setMessage({ type: 'error', text: 'Registration failed. Please try again.' })
      setIsAuthenticating(false)
    }
  }


  useEffect(() => {
    if (step === 5) {
      const cleanup = () => {
        localStorage.removeItem('thankYouData')
        localStorage.removeItem('bookingStep')
      }
      setTimeout(cleanup, 30000)
      return cleanup
    }
  }, [step])

  if (showBookingLoader) {
  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Booking Your Appointment</h3>
                <p className="text-muted-foreground mt-2">
                  Please wait while we confirm your booking...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 5) {
    const thankYouData = JSON.parse(localStorage.getItem('thankYouData') || '{}')

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-primary">DentalCare+</div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

        <main className="max-w-md mx-auto py-12 px-4">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Appointment Booked!</CardTitle>
              <CardDescription>
                Your appointment has been successfully scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p><strong>Dentist:</strong> Dr. {thankYouData.dentist || selectedDentistData?.name || 'Unknown'}</p>
                <p><strong>Service:</strong> {thankYouData.service || selectedServiceData?.name || 'Unknown'}</p>
                <p><strong>Date:</strong> {thankYouData.date || (selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Unknown')}</p>
                <p><strong>Time:</strong> {thankYouData.time || selectedTimeSlot?.time12 || 'Unknown'}</p>
                {(thankYouData.notes || notes) && <p><strong>Notes:</strong> {thankYouData.notes || notes}</p>}
          </div>
              <div className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard/appointments">
                      <Button className="w-full">View My Appointments</Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full">Back to Dashboard</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button className="w-full">Login to View Appointments</Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" className="w-full">Back to Home</Button>
                    </Link>
                  </>
                )}
                </div>
            </CardContent>
          </Card>
        </main>
                </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-primary">DentalCare+</div>
                <span className="text-muted-foreground hidden sm:inline">|</span>
                <span className="text-foreground font-medium hidden sm:inline">Book Appointment</span>
                </div>
              </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name}
                </span>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
              <ThemeToggle />
              </div>
            </div>
          </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-4 gap-4 text-center mb-8">
          {[
            { number: 1, label: 'Select Dentist' },
            { number: 2, label: 'Choose Service' },
            { number: 3, label: 'Pick Date & Time' },
            { number: 4, label: 'Confirm Details' }
          ].map(({ number, label }) => (
            <div key={number} className="flex flex-col items-center space-y-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-semibold ${
                step >= number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {number}
              </div>
              <div className={`text-sm font-medium ${
                step >= number ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {label}
              </div>
            </div>
          ))}
        </div>
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Select Dentist & Service'}
              {step === 2 && 'Choose Date & Time'}
              {step === 3 && 'Confirm Details'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Choose your preferred dentist and the service you need'}
              {step === 2 && 'Pick a convenient date and time for your appointment'}
              {step === 3 && 'Review your booking details before confirming'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                    <div>
                  <Label className="text-base font-medium mb-3 block">Select Dentist</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dentists.map((dentist) => (
                      <div
                        key={dentist._id}
                        onClick={() => setSelectedDentist(dentist._id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedDentist === dentist._id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">Dr. {dentist.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {dentist.specialization?.join(', ')}
                            </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                  <Label className="text-base font-medium mb-3 block">Select Service</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service._id}
                        onClick={() => setSelectedService(service._id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedService === service._id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{service.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.duration} minutes
                            </p>
                                </div>
                          <span className="font-bold text-primary">${service.price}</span>
                              </div>
                            </div>
                          ))}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && selectedDentist && (
              <div className="space-y-6">
                <AppointmentCalendar
                  dentistId={selectedDentist}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onTimeSelect={setSelectedTimeSlot}
                />
                        </div>
                      )}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <h3 className="font-medium mb-4">Appointment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dentist:</span>
                      <span className="font-medium">Dr. {selectedDentistData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{selectedServiceData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTimeSlot?.time12}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedServiceData?.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="font-medium">${selectedServiceData?.price}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any specific concerns or requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleBookingSubmit}
                  disabled={!canProceed() || isBooking || showBookingLoader}
                >
                  {isBooking || showBookingLoader ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </Button>
              )}
                  </div>
          </CardContent>
        </Card>
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {authMode === 'choice' && 'Login or Create Account'}
                {authMode === 'login' && 'Login to Your Account'}
                {authMode === 'register' && 'Create Your Account'}
              </DialogTitle>
              <DialogDescription>
                {authMode === 'choice' && 'To complete your booking, please login or create an account'}
                {authMode === 'login' && 'Enter your credentials to login'}
                {authMode === 'register' && 'Create an account to manage your appointments'}
              </DialogDescription>
            </DialogHeader>
            {authMode === 'choice' && (
              <div className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => setAuthMode('login')}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  I have an account
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setAuthMode('register')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create new account
                </Button>
                      </div>
                    )}
            {authMode === 'login' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="Enter your password"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAuthMode('choice')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleGuestLogin}
                    disabled={isAuthenticating || !loginData.email || !loginData.password}
                    className="flex-1"
                  >
                    {isAuthenticating ? 'Logging in...' : 'Login & Book'}
                  </Button>
                </div>
              </div>
            )}
            {authMode === 'register' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guest-name">Full Name</Label>
                  <Input
                    id="guest-name"
                    value={guestData.name}
                    onChange={(e) => setGuestData({...guestData, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-email">Email</Label>
                  <Input
                    id="guest-email"
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                          </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-phone">Phone</Label>
                  <Input
                    id="guest-phone"
                    value={guestData.phone}
                    onChange={(e) => setGuestData({...guestData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                          </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-password">Password</Label>
                  <Input
                    id="guest-password"
                    type="password"
                    value={guestData.password}
                    onChange={(e) => setGuestData({...guestData, password: e.target.value})}
                    placeholder="Create a password"
                  />
                  {guestData.password && (
                    <div className="text-xs space-y-1">
                      <div className={`${validatePassword(guestData.password).errors.minLength ? 'text-green-600' : 'text-red-600'}`}>
                        {validatePassword(guestData.password).errors.minLength ? '✓' : '✗'} At least 6 characters
                          </div>
                      <div className={`${validatePassword(guestData.password).errors.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                        {validatePassword(guestData.password).errors.hasUpperCase ? '✓' : '✗'} One uppercase letter
                          </div>
                      <div className={`${validatePassword(guestData.password).errors.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>
                        {validatePassword(guestData.password).errors.hasLowerCase ? '✓' : '✗'} One lowercase letter
                          </div>
                      <div className={`${validatePassword(guestData.password).errors.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                        {validatePassword(guestData.password).errors.hasNumber ? '✓' : '✗'} One number
                          </div>
                        </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-confirm-password">Confirm Password</Label>
                  <Input
                    id="guest-confirm-password"
                    type="password"
                    value={guestData.confirmPassword}
                    onChange={(e) => setGuestData({...guestData, confirmPassword: e.target.value})}
                    placeholder="Confirm your password"
                  />
                  {guestData.confirmPassword && (
                    <div className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </div>
                  )}
                    </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-birthdate">Date of Birth</Label>
                  <Input
                    id="guest-birthdate"
                    type="date"
                    value={guestData.birthdate}
                    onChange={(e) => setGuestData({...guestData, birthdate: e.target.value})}
                      />
                    </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-gender">Gender</Label>
                  <Select value={guestData.gender} onValueChange={(value) => setGuestData({...guestData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="guest-address">Address</Label>
                  <Input
                    id="guest-address"
                    value={guestData.address}
                    onChange={(e) => setGuestData({...guestData, address: e.target.value})}
                    placeholder="Enter your address"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAuthMode('choice')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleGuestRegister}
                    disabled={
                      isAuthenticating || 
                      !guestData.name || 
                      !guestData.email || 
                      !guestData.password || 
                      !guestData.confirmPassword ||
                      !guestData.phone || 
                      !guestData.birthdate || 
                      !guestData.gender || 
                      !guestData.address ||
                      !validatePassword(guestData.password).isValid ||
                      !passwordsMatch
                    }
                    className="flex-1"
                  >
                    {isAuthenticating ? 'Creating...' : 'Create & Book'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
} 