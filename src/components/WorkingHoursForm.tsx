'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Save } from 'lucide-react'

interface WorkingDay {
  start: string
  end: string
  isWorking: boolean
}

interface WorkingHours {
  monday: WorkingDay
  tuesday: WorkingDay
  wednesday: WorkingDay
  thursday: WorkingDay
  friday: WorkingDay
  saturday: WorkingDay
  sunday: WorkingDay
}

interface WorkingHoursFormProps {
  initialData?: WorkingHours
  onSubmit: (data: WorkingHours) => Promise<void>
  isLoading?: boolean
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { start: '09:00', end: '17:00', isWorking: true },
  tuesday: { start: '09:00', end: '17:00', isWorking: true },
  wednesday: { start: '09:00', end: '17:00', isWorking: true },
  thursday: { start: '09:00', end: '17:00', isWorking: true },
  friday: { start: '09:00', end: '17:00', isWorking: true },
  saturday: { start: '09:00', end: '13:00', isWorking: false },
  sunday: { start: '00:00', end: '00:00', isWorking: false }
}

export default function WorkingHoursForm({ 
  initialData = DEFAULT_WORKING_HOURS, 
  onSubmit, 
  isLoading = false 
}: WorkingHoursFormProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours>(initialData)

  const updateDay = (day: keyof WorkingHours, field: keyof WorkingDay, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(workingHours)
  }

  const copyToAllDays = (sourceDay: keyof WorkingHours) => {
    const sourceData = workingHours[sourceDay]
    const updatedHours = { ...workingHours }
    
    Object.keys(updatedHours).forEach(day => {
      if (day !== sourceDay) {
        updatedHours[day as keyof WorkingHours] = { ...sourceData }
      }
    })
    
    setWorkingHours(updatedHours)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Working Hours
        </CardTitle>
        <CardDescription>
          Set your weekly working schedule. Patients can only book appointments during these hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const day = workingHours[key as keyof WorkingHours]
              return (
                <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-20">
                    <Label className="font-medium">{label}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={day.isWorking}
                      onCheckedChange={(checked) => updateDay(key as keyof WorkingHours, 'isWorking', checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {day.isWorking ? 'Working' : 'Off'}
                    </span>
                  </div>

                  {day.isWorking && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${key}-start`} className="text-sm">From:</Label>
                        <Input
                          id={`${key}-start`}
                          type="time"
                          value={day.start}
                          onChange={(e) => updateDay(key as keyof WorkingHours, 'start', e.target.value)}
                          className="w-24"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${key}-end`} className="text-sm">To:</Label>
                        <Input
                          id={`${key}-end`}
                          type="time"
                          value={day.end}
                          onChange={(e) => updateDay(key as keyof WorkingHours, 'end', e.target.value)}
                          className="w-24"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyToAllDays(key as keyof WorkingHours)}
                        className="text-xs"
                      >
                        Copy to All
                      </Button>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWorkingHours(DEFAULT_WORKING_HOURS)}
            >
              Reset to Default
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Working Hours
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}