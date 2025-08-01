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
  Calendar, User, Settings, LogOut, LayoutDashboard, 
  Heart, FileText, Plus
} from 'lucide-react'

interface PatientLayoutProps {
  children: React.ReactNode
}

function PatientHeader() {
  const { user } = useAuthStore()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Patient Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Welcome, {user?.name}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function PatientSidebar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/book', label: 'Book Appointment', icon: Plus },
    // { href: '/dashboard/book', label: 'Book Appointment', icon: Plus },
    { href: '/dashboard/appointments', label: 'My Appointments', icon: Calendar },
    { href: '/dashboard/treatments', label: 'Treatment History', icon: FileText },
    { href: '/dashboard/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <Heart className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">DentalCare+</span>
            <span className="text-xs text-muted-foreground">Patient Portal</span>
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
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">{user?.name}</span>
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

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { user, isAuthenticated, isInitialized } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isInitialized, router])

  useEffect(() => {
    if (isInitialized && isAuthenticated && user?.role !== 'patient') {
      router.push('/')
    }
  }, [user, isAuthenticated, isInitialized, router])

  if (!isInitialized || !isAuthenticated || user?.role !== 'patient') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PatientSidebar />
        <SidebarInset className="flex-1">
          <PatientHeader />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}