'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

interface RoleBasedRouteProps {
  allowedRoles: ('patient' | 'admin' | 'dentist')[]
  children: React.ReactNode
  fallbackRoute?: string
}

export default function RoleBasedRoute({ 
  allowedRoles, 
  children, 
  fallbackRoute = '/login' 
}: RoleBasedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'dentist':
          router.push('/dentist/dashboard')
          break
        case 'patient':
          router.push('/dashboard')
          break
        default:
          router.push(fallbackRoute)
      }
    }
  }, [isAuthenticated, user, allowedRoles, router, fallbackRoute])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-500"></div>
      </div>
    )
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}