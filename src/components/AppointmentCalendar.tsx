'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/ui/calendar'

import { usePatientStore } from '@/stores/patientStore'
import { format, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface AvailabilityDay {
  date: string
  status: 'available' | 'limited' | 'fully-booked' | 'unavailable'
  availableSlots: number
  totalSlots: number
  timeSlots: Array<{
    time24: string
    time12: string
    isAvailable: boolean
    isBooked: boolean
  }>
}

interface AppointmentCalendarProps {
  dentistId: string
  selectedDate?: Date
  onDateSelect: (date: Date | undefined) => void
  onTimeSelect: (timeSlot: { time24: string; time12: string }) => void
}

export function AppointmentCalendar({ 
  dentistId, 
  selectedDate, 
  onDateSelect, 
  onTimeSelect 
}: AppointmentCalendarProps) {
  const { fetchDoctorAvailability } = usePatientStore()
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')

  const loadAvailability = useCallback(async () => {
    setIsLoading(true)
    try {
      const startDate = format(new Date(), 'yyyy-MM-dd')
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd')
      const data = await fetchDoctorAvailability(dentistId, startDate, endDate)
      const transformedData: AvailabilityDay[] = data.map(day => {
        const availableSlots = day.timeSlots.filter(slot => slot.available).length
        const totalSlots = day.timeSlots.length
        const status = availableSlots === 0 ? 'fully-booked' : 
                      availableSlots < totalSlots / 2 ? 'limited' : 'available'
        
        return {
          date: day.date,
          status: status as 'available' | 'limited' | 'fully-booked' | 'unavailable',
          availableSlots,
          totalSlots,
          timeSlots: day.timeSlots.map(slot => ({
            time24: slot.time,
            time12: slot.time, // You may want to convert this to 12-hour format
            isAvailable: slot.available,
            isBooked: !slot.available
          }))
        }
      })
      setAvailabilityData(transformedData)
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dentistId, fetchDoctorAvailability])

  useEffect(() => {
    if (dentistId) {
      loadAvailability()
    }
  }, [dentistId, loadAvailability])

  const getDateAvailability = (date: Date): AvailabilityDay | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return availabilityData.find(day => day.date === dateStr)
  }

  
  const handleDateSelect = (date: Date | undefined) => {
    onDateSelect(date)
    setSelectedTimeSlot('')
  }


  const handleTimeSelect = (timeSlot: { time24: string; time12: string }) => {
    setSelectedTimeSlot(timeSlot.time24)
    onTimeSelect(timeSlot)
  }

  
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return []
    const availability = getDateAvailability(selectedDate)
    return availability?.timeSlots.filter(slot => slot.isAvailable) || []
  }


  const isDateDisabled = (date: Date) => {
 
    if (date < new Date()) {
      return true
    }
    
    const availability = getDateAvailability(date)
    return availability?.status === 'unavailable' || availability?.status === 'fully-booked'
  }

  const availableTimeSlots = getAvailableTimeSlots()
  const selectedDateAvailability = selectedDate ? getDateAvailability(selectedDate) : null

  return (
    <div className="space-y-6">
 
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      ) : (
        <>
  
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border shadow-sm"
              modifiers={{
                available: (date) => {
                  const availability = getDateAvailability(date)
                  return availability?.status === 'available'
                },
                limited: (date) => {
                  const availability = getDateAvailability(date)
                  return availability?.status === 'limited'
                },
                fullyBooked: (date) => {
                  const availability = getDateAvailability(date)
                  return availability?.status === 'fully-booked'
                }
              }}
              modifiersClassNames={{
                available: 'bg-green-100 hover:bg-green-200 text-green-800',
                limited: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800', 
                fullyBooked: 'bg-red-100 hover:bg-red-200 text-red-800 line-through'
              }}
            />
          </div>

          <div className="flex justify-center">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Limited</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Fully Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {selectedDate && selectedDateAvailability && (
        <div className="text-center space-y-2">
          <h3 className="font-medium">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedDateAvailability.availableSlots} of {selectedDateAvailability.totalSlots} slots available
          </p>
        </div>
      )}

      {selectedDate && availableTimeSlots.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-center">Available Time Slots</h4>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableTimeSlots.map((slot) => (
              <button
                key={slot.time24}
                onClick={() => handleTimeSelect(slot)}
                className={cn(
                  'p-3 text-center border rounded-lg transition-colors',
                  selectedTimeSlot === slot.time24
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {slot.time12}
              </button>
            ))}
          </div>
        </div>
      )}

          {selectedDate && availableTimeSlots.length === 0 && selectedDateAvailability?.status !== 'unavailable' && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No available time slots for this date</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}