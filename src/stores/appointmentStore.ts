import { create } from 'zustand'
import api from '@/lib/axios'

export interface Dentist {
  _id: string
  name: string
  email: string
  specialization: string[]
  licenseNumber: string
  experience: number
  bio: string
  consultationFee: number
  isActive: boolean
}

export interface Service {
  _id: string
  name: string
  category: string
  description: string
  defaultDuration: number
  defaultPrice: number
}

export interface Appointment {
  _id: string
  patientId: string
  dentistId: Dentist
  serviceId: Service
  date: string
  time: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

interface AppointmentState {
  dentists: Dentist[]
  appointments: Appointment[]
  loading: boolean
  error: string | null
  fetchDentists: () => Promise<void>
  fetchPatientAppointments: () => Promise<void>
  bookAppointment: (appointment: {
    dentistId: string
    serviceId: string
    date: string
    time: string
    notes?: string
  }) => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<void>
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  dentists: [],
  appointments: [],
  loading: false,
  error: null,

  fetchDentists: async () => {
    try {
      set({ loading: true, error: null })
      const response = await api.get('/patients/dentists')
      const dentists = response.data?.dentists || []
      set({ dentists })
    } catch (error: unknown) {
      console.error('Failed to fetch dentists:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : 'Failed to fetch dentists'
      set({ dentists: [], error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  fetchPatientAppointments: async () => {
    try {
      set({ loading: true, error: null })
      const response = await api.get('/patients/appointments')
      const appointments = response.data?.appointments || []
      set({ appointments })
    } catch (error: unknown) {
      console.error('Failed to fetch appointments:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : 'Failed to fetch appointments'
      set({ appointments: [], error: errorMessage })
    } finally {
      set({ loading: false })
    }
  },

  bookAppointment: async (appointment) => {
    try {
      set({ loading: true, error: null })
      const response = await api.post('/patients/appointments', appointment)
      if (response.data.success) {
        get().fetchPatientAppointments()
      }
    } catch (error: unknown) {
      console.error('Failed to book appointment:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : 'Failed to book appointment'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  cancelAppointment: async (appointmentId: string) => {
    try {
      set({ loading: true, error: null })
      const response = await api.patch(`/patients/appointments/${appointmentId}/cancel`)
      if (response.data.success) {
        const currentAppointments = get().appointments || []
        set({ 
          appointments: currentAppointments.map(apt => 
            apt._id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
          )
        })
      }
    } catch (error: unknown) {
      console.error('Failed to cancel appointment:', error)
      const errorMessage = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data !== null && 'error' in error.response.data &&
        typeof error.response.data.error === 'string'
        ? error.response.data.error
        : 'Failed to cancel appointment'
      set({ error: errorMessage })
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))