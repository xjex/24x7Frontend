import { create } from 'zustand'
import api from '@/lib/axios'
import { User } from './authStore'

export interface AdminUser extends User {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
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
    licenseNumber?: string
    specialization?: string[]
    experience?: number
    consultationFee?: number
    bio?: string
    education?: Array<{
      degree: string
      university: string
      year: number
    }>
  }
}

export interface UserStats {
  totalUsers: number
  totalPatients: number
  totalDentists: number
  totalAdmins: number
  activeUsers: number
  inactiveUsers: number
}

export interface DentistFormData {
  name: string
  email: string
  password: string
  licenseNumber: string
  specialization: string[]
  experience: number
  consultationFee: number
  bio?: string
  education?: Array<{
    degree: string
    university: string
    year: number
  }>
}

export interface DentistUpdateData {
  name?: string
  licenseNumber?: string
  specialization?: string[]
  experience?: number
  consultationFee?: number
  bio?: string
  isActive?: boolean
  education?: Array<{
    degree: string
    university: string
    year: number
  }>
}

interface AdminState {
  users: AdminUser[]
  dentists: AdminUser[]
  patients: AdminUser[]
  userStats: UserStats | null
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchUsers: (filters?: { role?: string; page?: number; limit?: number }) => Promise<void>
  fetchDentists: (filters?: { page?: number; limit?: number }) => Promise<void>
  fetchPatients: (filters?: { page?: number; limit?: number }) => Promise<void>
  fetchUserStats: () => Promise<void>
  createDentist: (data: DentistFormData) => Promise<void>
  updateDentist: (dentistId: string, data: DentistUpdateData) => Promise<void>
  deleteDentist: (dentistId: string) => Promise<void>
  updateUserRole: (userId: string, newRole: 'patient' | 'admin' | 'dentist') => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  dentists: [],
  patients: [],
  userStats: null,
  isLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },

  fetchUsers: async (filters = {}) => {
    try {
      set({ isLoading: true })
      const params = new URLSearchParams()
      
      if (filters.role && filters.role !== 'all') {
        params.append('role', filters.role)
      }
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }

      const response = await api.get(`/admin/users?${params}`)
      const users = Array.isArray(response.data.users) ? response.data.users : []
      const pagination = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      
      set({ users, pagination })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      set({ users: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchDentists: async (filters = {}) => {
    try {
      set({ isLoading: true })
      const params = new URLSearchParams()
      
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }

      const response = await api.get(`/admin/dentists?${params}`)
      const dentists = Array.isArray(response.data.dentists) ? response.data.dentists : []
      const pagination = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      
      set({ dentists, pagination })
    } catch (error) {
      console.error('Failed to fetch dentists:', error)
      set({ dentists: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchPatients: async (filters = {}) => {
    try {
      set({ isLoading: true })
      const params = new URLSearchParams()
      
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }

      const response = await api.get(`/admin/patients?${params}`)
      const patients = Array.isArray(response.data.patients) ? response.data.patients : []
      const pagination = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 }
      
      set({ patients, pagination })
    } catch (error) {
      console.error('Failed to fetch patients:', error)
      set({ patients: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserStats: async () => {
    try {
      const response = await api.get('/admin/users/stats')
      set({ userStats: response.data.stats })
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      set({ userStats: null })
    }
  },

  createDentist: async (data: DentistFormData) => {
    try {
      set({ isLoading: true })
      await api.post('/admin/dentists', data)
      await get().fetchDentists()
      await get().fetchUserStats()
    } catch (error) {
      console.error('Failed to create dentist:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateDentist: async (dentistId: string, data: DentistUpdateData) => {
    try {
      set({ isLoading: true })
      await api.put(`/admin/dentists/${dentistId}`, data)
      await get().fetchDentists()
    } catch (error) {
      console.error('Failed to update dentist:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

    deleteDentist: async (dentistId: string) => {
    try {
      set({ isLoading: true })
      await api.delete(`/admin/dentists/${dentistId}`)

      const currentDentists = get().dentists
      set({
        dentists: currentDentists.filter(user => user._id !== dentistId)
      })
      await get().fetchUserStats()
    } catch (error) {
      console.error('Failed to delete dentist:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateUserRole: async (userId: string, newRole: 'patient' | 'admin' | 'dentist') => {
    try {
      set({ isLoading: true })
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      
      const currentUsers = get().users
      set({
        users: currentUsers.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        )
      })
      await get().fetchUserStats()
    } catch (error) {
      console.error('Failed to update user role:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

    deleteUser: async (userId: string) => {
    try {
      set({ isLoading: true })
      await api.delete(`/admin/users/${userId}`)

      const currentUsers = get().users
      const currentPatients = get().patients
      const currentDentists = get().dentists
      
      set({
        users: currentUsers.filter(user => user._id !== userId),
        patients: currentPatients.filter(user => user._id !== userId),
        dentists: currentDentists.filter(user => user._id !== userId)
      })
      await get().fetchUserStats()
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  }
}))