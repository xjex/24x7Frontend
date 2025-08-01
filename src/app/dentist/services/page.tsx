'use client'

import { useEffect } from 'react'
import { useDentistStore } from '@/stores/dentistStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Stethoscope,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react'

export default function DentistServicesPage() {
  const { services, isLoading, fetchMyServices } = useDentistStore()

  useEffect(() => {
    fetchMyServices()
  }, [fetchMyServices])

  const getCategoryColor = (category: string) => {
    const colors = {
      'Preventive': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Restorative': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Cosmetic': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Orthodontic': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Surgical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Emergency': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Consultation': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[category as keyof typeof colors] || colors['Consultation']
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h1>
        <p className="text-gray-600 dark:text-gray-400">Services you currently offer to patients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Available Services
          </CardTitle>
          <CardDescription>
            Services assigned to you by the administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-600 dark:text-gray-400">Loading services...</div>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No services assigned
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Contact your administrator to get services assigned to your profile.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {service.description}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Duration</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {service.defaultDuration} minutes
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Fee</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${service.defaultPrice}
                        </span>
                      </div>

                      {service.description && (
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Notes:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Service ID: {service._id.slice(-6)}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Summary</CardTitle>
            <CardDescription>
              Overview of your service offerings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {services.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Services</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {services.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Services</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${Math.round(services.reduce((sum, s) => sum + s.defaultPrice, 0) / services.length)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Fee</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}