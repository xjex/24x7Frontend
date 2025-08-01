'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Calendar, Users, User, Settings, LogOut, LayoutDashboard, 
  CalendarDays, Stethoscope, FileText
} from 'lucide-react'

interface DentistLayoutProps {
  children: React.ReactNode
}

function DentistHeader() {
  const { user } = useAuthStore()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Dentist Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Welcome, Dr. {user?.name}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function DentistSidebar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { href: '/dentist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dentist/appointments', label: 'Appointments', icon: Calendar },
    { href: '/dentist/schedule', label: 'Schedule Management', icon: CalendarDays },
    { href: '/dentist/patients', label: 'My Patients', icon: Users },
    { href: '/dentist/services', label: 'My Services', icon: Stethoscope },
    { href: '/dentist/reports', label: 'Reports', icon: FileText },
    { href: '/dentist/profile', label: 'Profile Settings', icon: User },
    { href: '/dentist/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">DentalCare+</span>
            <span className="text-xs text-muted-foreground">Dentist Portal</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-medium">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">Dr. {user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </div>
        <div className="flex gap-2 p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex-1"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function DentistLayout({ children }: DentistLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'dentist') {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== 'dentist') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <DentistSidebar />
      <SidebarInset>
        <DentistHeader />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}