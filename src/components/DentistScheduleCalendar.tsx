'use client'

import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Stethoscope, Plus } from 'lucide-react'
import { format, isToday } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/stores/dentistStore'

interface DentistScheduleCalendarProps {
  appointments: Appointment[]
  isLoading: boolean
  onDateSelect: (date: Date) => void
  onCreateAppointment: () => void
}

interface TimeSlot {
  time: string
  appointment?: Appointment
  available: boolean
}

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
]

export function DentistScheduleCalendar({ 
  appointments, 
  isLoading, 
  onDateSelect,
  onCreateAppointment 
}: DentistScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const filtered = appointments.filter(apt => apt.date === dateStr)
    setDayAppointments(filtered)
  }, [selectedDate, appointments])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onDateSelect(date)
    }
  }

  const generateTimeSlots = (): TimeSlot[] => {
    return TIME_SLOTS.map(time => {
      const appointment = dayAppointments.find(apt => apt.time === time)
      return {
        time,
        appointment,
        available: !appointment
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      case 'completed': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      case 'cancelled': return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'no-show': return 'bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800'
      default: return 'bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    }
  }

  const dateHasAppointments = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return appointments.some(apt => apt.date === dateStr)
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schedule for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
          <p className="text-muted-foreground">
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <Button onClick={onCreateAppointment}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Calendar</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="w-full"
                modifiers={{
                  hasAppointments: (date) => dateHasAppointments(date)
                }}
                modifiersClassNames={{
                  hasAppointments: 'bg-blue-100 dark:bg-blue-950/30 text-blue-900 dark:text-blue-400 font-medium'
                }}
              />
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Has appointments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6 hfu">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Daily Schedule</h3>
                {isToday(selectedDate) && (
                  <Badge variant="outline" className="bg-primary/10 dark:bg-primary/20 text-primary border-primary/20 dark:border-primary/30">
                    Today
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading schedule...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot.time}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md transition-colors",
                        slot.available 
                          ? "border border-border hover:bg-muted/50" 
                          : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 border-l-4 border-l-blue-500 dark:border-l-blue-400"
                      )}
                    >
                      <div className="w-16 flex-shrink-0">
                        <span className="text-sm font-medium">{slot.time}</span>
                      </div>

                      {slot.appointment ? (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm truncate">
                                  {slot.appointment.patientId.name || 'Unknown Patient'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground truncate">
                                  {slot.appointment.serviceId.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({slot.appointment.duration}min)
                                </span>
                              </div>

                              {slot.appointment.notes && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {slot.appointment.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0 ml-4">
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs", getStatusColor(slot.appointment.status))}
                              >
                                {slot.appointment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-sm text-muted-foreground italic">
                          Available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

             
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}