"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  Calendar,
  Users,
  User,
  Settings,
  BarChart3,
  Shield,
  LogOut,
  Home,
  Plus,
  Clock,
  CalendarDays
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

const adminMenuItems = [
  { icon: Home, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Shield, label: "Permissions", href: "/admin/permissions" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

const dentistMenuItems = [
  { icon: Home, label: "Dashboard", href: "/dentist/dashboard" },
  { icon: Calendar, label: "Schedule", href: "/dentist/schedule" },
  { icon: Users, label: "Patients", href: "/dentist/patients" },
  { icon: Clock, label: "Appointments", href: "/dentist/appointments" },
  { icon: BarChart3, label: "Reports", href: "/dentist/reports" },
  { icon: Settings, label: "Settings", href: "/dentist/settings" },
]

const patientMenuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Plus, label: "Book Appointment", href: "/book" },
  { icon: Calendar, label: "My Appointments", href: "/appointments" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

function AppSidebar() {
  const { user } = useAuthStore()
  const pathname = usePathname()
  
  const menuItems = user?.role === 'admin' ? adminMenuItems : 
                   user?.role === 'dentist' ? dentistMenuItems : 
                   patientMenuItems

  const roleIcon = user?.role === 'admin' ? Shield : 
                  user?.role === 'dentist' ? CalendarDays : 
                  User

  const RoleIcon = roleIcon

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
          <RoleIcon className="h-5 w-5 text-blue-600" />
          DentalCare+
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {user?.role === 'admin' ? 'Admin Portal' : 
           user?.role === 'dentist' ? 'Dentist Portal' : 
           'Patient Portal'}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Navigation
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
                              {user?.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email}
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardHeader({ title, description }: { title: string; description?: string }) {
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-900/90">
      <div className="flex h-14 items-center px-6">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title={title} description={description} />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}