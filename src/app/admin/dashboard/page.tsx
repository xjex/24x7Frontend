'use client'

import { useEffect } from 'react'
import { useAdminStore } from '@/stores/adminStore'
import Link from 'next/link'
import { 
  Users, 
  BarChart3,
  UserCheck,
  Stethoscope,
  Plus,
  Shield,
  Settings,
  BarChart
} from 'lucide-react'

export default function AdminDashboard() {
  const { userStats, fetchUserStats } = useAdminStore()

  useEffect(() => {
    fetchUserStats()
  }, [fetchUserStats])

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">System overview and quick actions</p>
      </div>

      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="pretty-card p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{userStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="pretty-card p-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{userStats.activeUsers}</p>
              </div>
            </div>
          </div>
          <div className="pretty-card p-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-8 w-8 text-dental-500" />
              <div>
                <p className="text-sm text-muted-foreground">Dentists</p>
                <p className="text-2xl font-bold text-foreground">{userStats.totalDentists}</p>
              </div>
            </div>
          </div>
          <div className="pretty-card p-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Inactive Users</p>
                <p className="text-2xl font-bold text-foreground">{userStats.inactiveUsers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pretty-card p-6 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Quick Actions</h2>
          <p className="text-muted-foreground">Common administrative tasks and shortcuts</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/admin/users">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Users</h3>
                  <p className="text-sm text-muted-foreground">View and edit user accounts</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/dentists">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Dentists</h3>
                  <p className="text-sm text-muted-foreground">Add and manage dentist profiles</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/patients">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Patients</h3>
                  <p className="text-sm text-muted-foreground">View and manage patient profiles</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/permissions">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Permissions</h3>
                  <p className="text-sm text-muted-foreground">Configure user permissions</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/analytics">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/40 transition-colors">
                  <BarChart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View system reports and insights</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/services">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-teal-300 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center group-hover:bg-teal-200 dark:group-hover:bg-teal-900/40 transition-colors">
                  <Settings className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Manage Services</h3>
                  <p className="text-sm text-muted-foreground">Create and assign dental services</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-400 hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure system settings</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer group">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Add More</h3>
                <p className="text-sm text-muted-foreground">Additional quick actions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}