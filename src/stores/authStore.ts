import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/axios'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'patient' | 'dentist' | 'admin'
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Omit<User, 'id' | 'role'> & { password: string }) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/login', { email, password })
          const { token, user } = response.data
          
          localStorage.setItem('token', token)
          set({ user, isAuthenticated: true })
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