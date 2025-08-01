'use client'

import { useEffect, useState } from 'react'
import { useDentistStore, type WorkingHours } from '@/stores/dentistStore'
import WorkingHoursForm from '@/components/WorkingHoursForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

export default function WorkingHoursPage() {
  const { 
    fetchWorkingHours, 
    updateWorkingHours, 
    isLoading 
  } = useDentistStore()
  
  const [workingHours, setWorkingHours] = useState<WorkingHours | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const loadWorkingHours = async () => {
      try {
        const hours = await fetchWorkingHours()
        setWorkingHours(hours)
      } catch (error) {
        console.error('Failed to load working hours:', error)
        setMessage({ type: 'error', text: 'Failed to load working hours' })
      }
    }

    loadWorkingHours()
  }, [fetchWorkingHours])

  const handleUpdateWorkingHours = async (data: WorkingHours) => {
    try {
      setIsUpdating(true)
      setMessage(null)
      
      await updateWorkingHours(data)
      setWorkingHours(data)
      setMessage({ type: 'success', text: 'Working hours updated successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to update working hours:', error)
      setMessage({ type: 'error', text: 'Failed to update working hours. Please try again.' })
    } finally {
      setIsUpdating(false)
    }
  }

  const getWorkingSummary = () => {
    if (!workingHours) return null

    const workingDays = Object.entries(workingHours)
      .filter(([_, day]) => day.isWorking)
      .map(([dayName, day]) => ({
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        hours: `${day.start} - ${day.end}`
      }))

    return workingDays
  }

  if (isLoading && !workingHours) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading working hours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Working Hours</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your weekly schedule and availability
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Working Hours Form */}
        <div className="lg:col-span-2">
          {workingHours ? (
            <WorkingHoursForm
              initialData={workingHours}
              onSubmit={handleUpdateWorkingHours}
              isLoading={isUpdating}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No working hours configured
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Set up your weekly schedule to allow patients to book appointments
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Current Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Current Schedule
              </CardTitle>
              <CardDescription>
                Your active working days and hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workingHours ? (
                <div className="space-y-3">
                  {getWorkingSummary()?.map(day => (
                    <div key={day.name} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {day.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {day.hours}
                      </span>
                    </div>
                  ))}
                  {getWorkingSummary()?.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No working days configured
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Configure your working hours to see schedule summary
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><strong>Schedule Management:</strong></p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Set realistic working hours</li>
                  <li>Consider lunch breaks (1-2 PM gap)</li>
                                  <li>Use &quot;Copy to All&quot; for consistent schedules</li>
                <li>Mark non-working days as &quot;Off&quot;</li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><strong>Patient Booking:</strong></p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Patients can only book during working hours</li>
                  <li>30-minute time slots are generated automatically</li>
                  <li>Changes take effect immediately</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}