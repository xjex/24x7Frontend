'use client'

import { useEffect, useState } from 'react'
import { usePatientStore } from '@/stores/patientStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Clock, 
  User, 
  DollarSign,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { AppointmentCalendar } from '@/components/AppointmentCalendar'

export default function BookAppointmentPage() {
  const { 
    dentists, 
    services, 
    fetchDentists, 
    fetchServices, 
    bookAppointment,
    isLoading,
    isBooking
  } = usePatientStore()

  const [step, setStep] = useState(1)
  const [selectedDentist, setSelectedDentist] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ time24: string; time12: string } | null>(null)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchDentists()
    fetchServices()
  }, [fetchDentists, fetchServices])

  const selectedDentistData = dentists.find(d => d._id === selectedDentist)
  const selectedServiceData = services.find(s => s._id === selectedService)

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

  const handleSubmit = async () => {
    if (!selectedDentist || !selectedService || !selectedDate || !selectedTimeSlot) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    try {
      await bookAppointment({
        dentistId: selectedDentist,
        serviceId: selectedService,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTimeSlot.time24,
        notes
      })
      
      setMessage({ type: 'success', text: 'Appointment booked successfully!' })
      setStep(5) // Success step
    } catch {
      setMessage({ type: 'error', text: 'Failed to book appointment. Please try again.' })
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDentist !== ''
      case 2:
        return selectedService !== ''
      case 3:
        return selectedDate !== undefined
      case 4:
        return selectedTimeSlot !== null
      default:
        return false
    }
  }

  if (step === 5) {
    return (
      <div className="max-w-md mx-auto space-y-6">
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
              <p><strong>Dentist:</strong> {selectedDentistData?.name}</p>
              <p><strong>Service:</strong> {selectedServiceData?.name}</p>
              <p><strong>Date:</strong> {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</p>
              <p><strong>Time:</strong> {selectedTimeSlot?.time12}</p>
              {notes && <p><strong>Notes:</strong> {notes}</p>}
            </div>
            <div className="space-y-2">
              <Link href="/dashboard/appointments">
                <Button className="w-full">View My Appointments</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Book an Appointment</h1>
          <p className="text-muted-foreground">Schedule your dental visit in a few easy steps</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-4 gap-4 text-center">
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

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Select Your Dentist'}
            {step === 2 && 'Choose a Service'}
            {step === 3 && 'Pick Your Preferred Date & Time'}
            {step === 4 && 'Confirm Your Appointment'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Choose from our available dental professionals'}
            {step === 2 && 'Select the dental service you need'}
            {step === 3 && 'Pick a date and time that works for you'}
            {step === 4 && 'Review your appointment details before booking'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Select Dentist */}
          {step === 1 && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <div>Loading dentists...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dentists.map((dentist) => (
                    <div
                      key={dentist._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedDentist === dentist._id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedDentist(dentist._id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{dentist.name}</h3>
                          <p className="text-sm text-muted-foreground">{dentist.specialization.join(', ')}</p>
                          <p className="text-sm text-muted-foreground">{dentist.experience} years experience</p>
                          <div className="flex items-center gap-1 mt-2">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-sm">${dentist.consultationFee} consultation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Service */}
          {step === 2 && (
            <div className="space-y-4">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${service.price} • {service.duration}min • {service.category}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedServiceData && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold">{selectedServiceData.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedServiceData.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedServiceData.duration} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${selectedServiceData.price}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Select Date */}
          {step === 3 && selectedDentist && (
            <AppointmentCalendar
              dentistId={selectedDentist}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onTimeSelect={(timeSlot) => {
                setSelectedTimeSlot(timeSlot)
                setStep(4) // Auto advance to step 4 when time is selected
              }}
            />
          )}

          {/* Step 4: Confirm Details */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Selected appointment details */}
              <div className="space-y-4">
                <h4 className="font-medium">Appointment Summary</h4>
                
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dentist:</span>
                      <span className="font-medium">{selectedDentistData?.name}</span>
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
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  placeholder="Any specific concerns or requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Change selections */}
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setStep(3)}
                >
                  Change Date/Time
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setStep(2)}
                >
                  Change Service
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isBooking}
              >
                {isBooking ? 'Booking...' : 'Book Appointment'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}