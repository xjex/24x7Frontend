import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/axios'

export interface User {
  id: string
  name: string
  email: string
  role: 'patient' | 'admin' | 'dentist'
  isActive: boolean
  profile?: {
    phone?: string
    birthdate?: string
    gender?: string
    address?: string
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
    medicalHistory?: {
      allergies?: string[]
      medications?: string[]
      conditions?: string[]
      notes?: string
    }
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ redirectTo: string }>
  register: (userData: { name: string; email: string; password: string; phone: string; birthdate: string; gender: string; address: string }) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  getRoleBasedRedirect: (role: string) => string
  initializeAuth: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      getRoleBasedRedirect: (role: string) => {
        switch (role) {
          case 'admin':
            return '/admin/dashboard'
          case 'dentist':
            return '/dentist/dashboard'
          case 'patient':
            return '/dashboard'
          default:
            return '/dashboard'
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          localStorage.setItem('token', token)
          set({ user, isAuthenticated: true })
          
          const redirectTo = (() => {
            switch (user.role) {
              case 'admin':
                return '/admin/dashboard'
              case 'dentist':
                return '/dentist/dashboard'
              case 'patient':
                return '/dashboard'
              default:
                return '/dashboard'
            }
          })()
          
          return { redirectTo }
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/register', userData)
          const { token, user } = response.data
          
          localStorage.setItem('token', token)
          set({ user, isAuthenticated: true })
        } catch (error) {
          console.error('Registration failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false })
      },

      clearAuth: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false, isInitialized: true })
      },

      initializeAuth: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ isInitialized: true })
          return
        }

        try {
          set({ isLoading: true })
          const response = await api.get('/auth/me')
          const { user } = response.data
          set({ user, isAuthenticated: true, isInitialized: true })
        } catch (error) {
          console.error('Auth initialization failed:', error)
          localStorage.removeItem('token')
          set({ user: null, isAuthenticated: false, isInitialized: true })
        } finally {
          set({ isLoading: false })
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await api.put('/auth/profile', userData)
          const { user } = response.data
          
          set({ user })
        } catch (error) {
          console.error('Profile update failed:', error)
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
) 