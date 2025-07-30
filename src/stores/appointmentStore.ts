import { create } from 'zustand'
import api from '@/lib/axios'

export interface Dentist {
  id: string
  firstName: string
  lastName: string
  specialization: string
  availableSlots: string[]
}

export interface Appointment {
  id: string
  patientId: string
  dentistId: string
  dentist?: Dentist
  date: string
  time: string
  service: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

interface AppointmentState {
  appointments: Appointment[]
  dentists: Dentist[]
  isLoading: boolean
  fetchAppointments: () => Promise<void>
  fetchDentists: () => Promise<void>
  bookAppointment: (appointmentData: Omit<Appointment, 'id' | 'status'>) => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<void>
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<void>
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  dentists: [],
  isLoading: false,

  fetchAppointments: async () => {
    try {
      set({ isLoading: true })
      const response = await api.get('/appointments')
      set({ appointments: Array.isArray(response.data) ? response.data : [] })
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      set({ appointments: [] })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchDentists: async () => {
    try {
      set({ isLoading: true })
      const response = await api.get('/dentists')
      set({ dentists: Array.isArray(response.data) ? response.data : [] })
    } catch (error) {
      console.error('Failed to fetch dentists:', error)
      set({ dentists: [] })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      set({ isLoading: true })
      const response = await api.post('/appointments', appointmentData)
      const newAppointment = response.data
      set(state => ({ 
        appointments: [...state.appointments, newAppointment] 
      }))
    } catch (error) {
      console.error('Failed to book appointment:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      set({ isLoading: true })
      await api.delete(`/appointments/${appointmentId}`)
      set(state => ({
        appointments: state.appointments.filter(apt => apt.id !== appointmentId)
      }))
    } catch (error) {
      console.error('Failed to cancel appointment:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  rescheduleAppointment: async (appointmentId, newDate, newTime) => {
    try {
      set({ isLoading: true })
      const response = await api.put(`/appointments/${appointmentId}`, {
        date: newDate,
        time: newTime
      })
      const updatedAppointment = response.data
      set(state => ({
        appointments: state.appointments.map(apt =>
          apt.id === appointmentId ? updatedAppointment : apt
        )
      }))
    } catch (error) {
      console.error('Failed to reschedule appointment:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
})) 