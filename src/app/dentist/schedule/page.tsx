'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDentistStore, type CreateAppointmentData, type Patient } from '@/stores/dentistStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  CalendarDays,
  Check,
  ChevronsUpDown
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format, parseISO, isWeekend } from 'date-fns'
import { DentistScheduleCalendar } from '@/components/DentistScheduleCalendar'

export default function DentistSchedulePage() {
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get('patientId')
  
  const { 
    patients, 
    services, 
    appointments,
    isLoading, 
    fetchPatients, 
    fetchMyServices,
    fetchAllPatients,
    fetchAppointments,
    createAppointment 
  } = useDentistStore()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [showAllPatients, setShowAllPatients] = useState(false)
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [patientComboboxOpen, setPatientComboboxOpen] = useState(false)

  useEffect(() => {
    fetchPatients()
    fetchMyServices()
    fetchAppointments()
  }, [fetchPatients, fetchMyServices, fetchAppointments])

  useEffect(() => {
    if (showAllPatients && allPatients.length === 0) {
      fetchAllPatients().then(patients => {
        setAllPatients(patients)
      })
    }
  }, [showAllPatients, fetchAllPatients, allPatients.length])

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p._id === preselectedPatientId)
      if (patient) {
        setSelectedPatient(preselectedPatientId)
        setShowCreateForm(true)
      }
    }
  }, [preselectedPatientId, patients])



  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  // Choose which patient list to use based on toggle
  const currentPatientList = showAllPatients ? allPatients : patients

  const selectedPatientData = selectedPatient ? currentPatientList.find(p => p._id === selectedPatient) : null
  const selectedServiceData = services.find(s => s._id === selectedService)

  const handleServiceChange = (serviceId: string) => {
    setSelectedService(serviceId)
    const service = services.find(s => s._id === serviceId)
    if (service) {
      setDuration(service.defaultDuration)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'))
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPatient || !selectedService || !selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    try {
      setIsSubmitting(true)
      setMessage(null)
      
      const appointmentData: CreateAppointmentData = {
        patientId: selectedPatient,
        serviceId: selectedService,
        date: selectedDate,
        time: selectedTime,
        duration,
        notes: notes || undefined
      }

      await createAppointment(appointmentData)
      
      setMessage({ type: 'success', text: 'Appointment scheduled successfully!' })
      
      // Reset form
      setSelectedPatient('')
      setSelectedService('')
      setSelectedDate('')
      setSelectedTime('')
      setDuration(30)
      setNotes('')
      setShowCreateForm(false)
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to schedule appointment. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <div className="space-y-6">

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {showCreateForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Schedule New Appointment
            </CardTitle>
            <CardDescription>
              Create a new appointment for your patient
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAppointment} className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Select Patient
                </Label>
                
                {!preselectedPatientId && (
                  <div className="space-y-3">
                    {/* Patient Source Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          {showAllPatients ? 'All Patients' : 'My Patients'}
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {showAllPatients 
                            ? `Browse all ${isLoading ? '...' : allPatients.length} patients in the system`
                            : `Browse your ${patients.length} existing patients`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-sm", !showAllPatients ? "font-medium" : "text-gray-500")}>
                          My Patients
                        </span>
                        <Switch
                          checked={showAllPatients}
                          onCheckedChange={setShowAllPatients}
                        />
                        <span className={cn("text-sm", showAllPatients ? "font-medium" : "text-gray-500")}>
                          All Patients
                        </span>
                      </div>
                    </div>

                  </div>
                )}
                
                {/* Patient Combobox */}
                <Popover open={patientComboboxOpen} onOpenChange={setPatientComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={patientComboboxOpen}
                      className="w-full justify-between h-9 text-sm"
                      disabled={!!preselectedPatientId}
                    >
                      {selectedPatient
                        ? (() => {
                            const patient = currentPatientList.find(p => p._id === selectedPatient)
                            return patient 
                              ? `${patient.name || 'Unknown'} - ${patient.email || 'No email'}`
                              : "Choose a patient..."
                          })()
                        : "Choose a patient..."
                      }
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder={`Search ${showAllPatients ? 'all' : 'your'} patients...`} 
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No patients found.</CommandEmpty>
                        <CommandGroup>
                          {currentPatientList.map((patient) => (
                            <CommandItem
                              key={patient._id}
                              value={`${patient.name || 'Unknown'} ${patient.email || ''} ${patient.phone || ''}`}
                              onSelect={() => {
                                setSelectedPatient(patient._id === selectedPatient ? "" : patient._id)
                                setPatientComboboxOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPatient === patient._id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {patient.name || 'Unknown'}
                                  {showAllPatients && !patients.find(p => p._id === patient._id) && ' (New)'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {patient.email || 'No email'}
                                  {patient.phone && ` • ${patient.phone}`}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                
                {showAllPatients && selectedPatient && !patients.find(p => p._id === selectedPatient) && (
                  <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                    <strong>Note:</strong> This will be a new patient for you. They will be added to your patient list after the appointment is created.
                  </div>
                )}
                {selectedPatientData && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedPatientData.name || 'Unknown Patient'}</span>
                    </div>
                    <div className="mt-1">{selectedPatientData.email || 'No email'}</div>
                    {(selectedPatientData.profile?.phone || selectedPatientData.phone) && (
                      <div>{selectedPatientData.profile?.phone || selectedPatientData.phone}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Select Service
                </Label>
                <Select value={selectedService} onValueChange={handleServiceChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choose a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service._id} value={service._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{service.name}</span>
                          <span className="text-sm text-gray-500">
                            ${service.defaultPrice} • {service.defaultDuration}min • {service.category}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedServiceData && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    <div className="font-medium">{selectedServiceData.name}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span>Duration: {selectedServiceData.defaultDuration} minutes</span>
                      <span>Fee: ${selectedServiceData.defaultPrice}</span>
                      <span>Category: {selectedServiceData.category}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Select Date
                </Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? parseISO(selectedDate) : undefined}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        setSelectedDate(format(date, 'yyyy-MM-dd'))
                      }
                    }}
                    disabled={(date: Date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today || isWeekend(date)
                    }}
                    className="rounded-md border shadow-sm"
                  />
                </div>
                {selectedDate && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Selected: {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {selectedDate && (
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Select Time
                  </Label>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 text-center border rounded-lg transition-colors hover:scale-105 ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                            : 'border-border hover:bg-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="text-sm font-medium">{time}</div>
                      </button>
                    ))}
                  </div>
                  {selectedTime && (
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        Selected time: {selectedTime}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                  className="w-full"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes (Optional)
                </Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special notes or instructions for this appointment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <DentistScheduleCalendar
          appointments={appointments}
          isLoading={isLoading}
          onDateSelect={handleDateSelect}
          onCreateAppointment={() => setShowCreateForm(true)}
        />
      )}
    </div>
  )
}