'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/authStore'
import { useAppointmentStore } from '@/stores/appointmentStore'
import { Button } from '@/components/ui/button'

import { ThemeToggle } from '@/components/theme-toggle'
import { Clock, User, ArrowLeft, Check } from 'lucide-react'
import { format, addDays, isWeekend } from 'date-fns'

interface BookingForm {
  dentistId: string
  date: string
  time: string
  service: string
  notes?: string
}

const services = [
  { id: 'cleaning', name: 'Dental Cleaning', duration: '1 hour', price: '$150' },
  { id: 'checkup', name: 'Regular Checkup', duration: '30 minutes', price: '$100' },
  { id: 'filling', name: 'Dental Filling', duration: '1.5 hours', price: '$250' },
  { id: 'whitening', name: 'Teeth Whitening', duration: '2 hours', price: '$400' },
  { id: 'extraction', name: 'Tooth Extraction', duration: '1 hour', price: '$300' },
  { id: 'root-canal', name: 'Root Canal', duration: '2 hours', price: '$800' },
  { id: 'crown', name: 'Crown Placement', duration: '1.5 hours', price: '$1200' },
  { id: 'consultation', name: 'Consultation', duration: '30 minutes', price: '$75' },
]

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
]

export default function BookingPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { dentists, fetchDentists, bookAppointment, isLoading } = useAppointmentStore()
  const [selectedDentist, setSelectedDentist] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedService, setSelectedService] = useState<string>('')
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue } = useForm<BookingForm>()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchDentists()
  }, [isAuthenticated, fetchDentists, router])

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

  const isTimeSlotAvailable = (_: string) => {
    return true
  }

  const handleDateSelect = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    setSelectedDate(dateString)
    setValue('date', dateString)
    setSelectedTime('')
    setValue('time', '')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setValue('time', time)
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setValue('service', serviceId)
  }

  const handleDentistSelect = (dentistId: string) => {
    setSelectedDentist(dentistId)
    setValue('dentistId', dentistId)
  }

  const onSubmit = async (data: BookingForm) => {
    if (!user) return

    try {
      setIsSubmitting(true)
      await bookAppointment({
        patientId: user.id,
        dentistId: data.dentistId,
        date: data.date,
        time: data.time,
        service: data.service,
        notes: data.notes
      })
      
      router.push('/dashboard?booking=success')
    } catch (error) {
      console.error('Failed to book appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedServiceData = services.find(s => s.id === selectedService)
  const selectedDentistData = (dentists || []).find(d => d.id === selectedDentist)
  const availableDates = generateAvailableDates()

  const canProceedToStep2 = selectedService && selectedDentist
  const canProceedToStep3 = canProceedToStep2 && selectedDate && selectedTime
  const canSubmit = canProceedToStep3

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen page-background">
      <header className="gradient-bg-primary shadow-lg">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-gray-900 text-sm px-3 py-2">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-xl sm:text-2xl font-bold text-white">DentalCare+</div>
                <span className="text-white/70 hidden sm:inline">|</span>
                <span className="text-white/90 font-medium text-sm sm:text-base hidden sm:inline">Book Appointment</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">Book Your Appointment</h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Schedule your visit with one of our experienced dentists and take the first step towards a healthier smile
            </p>
          </div>

          <div className="flex items-center justify-center mb-8 sm:mb-12">
            <div className="pretty-card p-4 sm:p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between sm:justify-center sm:space-x-6">
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 ${step >= 1 ? 'gradient-bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 1 ? <Check className="h-3 w-3 sm:h-5 sm:w-5" /> : '1'}
                </div>
                <div className={`h-1 sm:h-2 flex-1 sm:w-12 lg:w-20 rounded-full transition-all duration-300 ${step >= 2 ? 'gradient-bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 ${step >= 2 ? 'gradient-bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 2 ? <Check className="h-3 w-3 sm:h-5 sm:w-5" /> : '2'}
                </div>
                <div className={`h-1 sm:h-2 flex-1 sm:w-12 lg:w-20 rounded-full transition-all duration-300 ${step >= 3 ? 'gradient-bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full text-sm sm:text-lg font-bold transition-all duration-300 ${step >= 3 ? 'gradient-bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
                  {step > 3 ? <Check className="h-3 w-3 sm:h-5 sm:w-5" /> : '3'}
                </div>
              </div>
              <div className="flex justify-between mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-muted-foreground">
                <span className="text-center">Service &<br className="sm:hidden"/> Dentist</span>
                <span className="text-center">Date &<br className="sm:hidden"/> Time</span>
                <span className="text-center">Review &<br className="sm:hidden"/> Confirm</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div className="pretty-card p-6 sm:p-8">
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Step 1: Select Service & Dentist</h2>
                    <p className="text-base sm:text-lg text-muted-foreground">Choose the service you need and your preferred dentist</p>
                  </div>
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-4 sm:mb-6">Select Service</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            onClick={() => handleServiceSelect(service.id)}
                            className={`p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                              selectedService === service.id
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-green-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-dental-600">{service.name}</h4>
                                <p className="text-sm sm:text-base text-muted-foreground mt-1">{service.duration}</p>
                              </div>
                              <span className="font-bold text-xl sm:text-2xl text-dental-600 self-end sm:self-start">{service.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-4 sm:mb-6">Select Dentist</h3>
                      {isLoading ? (
                        <div className="text-center py-6 sm:py-8 text-muted-foreground">
                          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-dental-500 mx-auto mb-3 sm:mb-4"></div>
                          <span className="text-sm sm:text-base">Loading dentists...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {(dentists || []).map((dentist) => (
                            <div
                              key={dentist.id}
                              onClick={() => handleDentistSelect(dentist.id)}
                              className={`p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 group ${
                                selectedDentist === dentist.id
                                  ? 'border-dental-500 bg-dental-50 dark:bg-dental-900/20 shadow-lg'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-dental-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 gradient-bg-primary rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-foreground truncate">Dr. {dentist.firstName} {dentist.lastName}</h4>
                                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">{dentist.specialization}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 sm:pt-6">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    variant="dental"
                    className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg"
                  >
                    Continue to Date & Time
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="pretty-card p-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Step 2: Select Date & Time</h2>
                    <p className="text-lg text-muted-foreground">Choose your preferred appointment date and time</p>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground mb-6">Select Date</h3>
                      <div className="grid grid-cols-7 gap-3">
                        {availableDates.map((date) => (
                          <button
                            key={date.toISOString()}
                            type="button"
                            onClick={() => handleDateSelect(date)}
                            className={`p-4 text-center border-2 rounded-xl hover:border-dental-300 transition-all duration-300 ${
                              selectedDate === format(date, 'yyyy-MM-dd')
                                ? 'border-dental-500 bg-dental-50 dark:bg-dental-900/20 text-dental-700 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                            }`}
                          >
                            <div className="text-xs text-muted-foreground mb-1">
                              {format(date, 'EEE')}
                            </div>
                            <div className="font-medium text-foreground">
                              {format(date, 'd')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(date, 'MMM')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedDate && (
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-6">Select Time</h3>
                        <div className="grid grid-cols-4 gap-3">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeSelect(time)}
                              disabled={!isTimeSlotAvailable(time)}
                              className={`p-4 text-center border-2 rounded-xl transition-all duration-300 ${
                                selectedTime === time
                                  ? 'border-dental-500 bg-dental-50 dark:bg-dental-900/20 text-dental-700 shadow-lg'
                                  : isTimeSlotAvailable(time)
                                  ? 'border-gray-200 dark:border-gray-700 hover:border-dental-300 hover:shadow-md'
                                  : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <Clock className="h-4 w-4 mx-auto mb-1" />
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canProceedToStep3}
                    variant="dental"
                  >
                    Review Booking
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="pretty-card p-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Step 3: Review & Confirm</h2>
                    <p className="text-lg text-muted-foreground">Please review your appointment details before confirming</p>
                  </div>
                  <div className="space-y-8">
                    <div className="bg-dental-50 dark:bg-dental-900/20 p-8 rounded-xl border border-dental-200 dark:border-dental-700">
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-6">Appointment Summary</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between py-3 border-b border-dental-200 dark:border-dental-700">
                            <span className="text-muted-foreground font-medium">Service:</span>
                            <span className="font-semibold text-foreground">{selectedServiceData?.name}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-dental-200 dark:border-dental-700">
                            <span className="text-muted-foreground font-medium">Duration:</span>
                            <span className="text-foreground">{selectedServiceData?.duration}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-dental-200 dark:border-dental-700">
                            <span className="text-muted-foreground font-medium">Price:</span>
                            <span className="font-semibold text-dental-600 text-xl">{selectedServiceData?.price}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-dental-200 dark:border-dental-700">
                            <span className="text-muted-foreground font-medium">Dentist:</span>
                            <span className="font-semibold text-foreground">Dr. {selectedDentistData?.firstName} {selectedDentistData?.lastName}</span>
                          </div>
                          <div className="flex justify-between py-3 border-b border-dental-200 dark:border-dental-700">
                            <span className="text-muted-foreground font-medium">Date:</span>
                            <span className="font-semibold text-foreground">{selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : ''}</span>
                          </div>
                          <div className="flex justify-between py-3">
                            <span className="text-muted-foreground font-medium">Time:</span>
                            <span className="font-semibold text-foreground">{selectedTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">Additional Notes (Optional)</h3>
                      <textarea
                        {...register('notes')}
                        id="notes"
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-dental-500 focus:border-dental-500 bg-white dark:bg-gray-800 text-foreground placeholder-muted-foreground resize-none"
                        placeholder="Any specific concerns or requests for your appointment..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} size="lg" className="px-8 py-4 text-lg">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    variant="dental"
                    size="lg"
                    className="min-w-[180px] px-8 py-4 text-lg"
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  )
} 