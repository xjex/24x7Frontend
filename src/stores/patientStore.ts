import { create } from 'zustand'
import axios from '@/lib/axios'

export interface PatientProfile {
  _id?: string
  id?: string
  name: string
  email: string
  role?: string
  isActive?: boolean
  phone?: string
  birthdate?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  profile?: {
    _id: string
    userId: string
    phone?: string
    birthdate?: string
    gender?: 'male' | 'female' | 'other'
    address?: string
    createdAt: string
    updatedAt: string
  }
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
  createdAt?: string
  updatedAt?: string
}

export interface Dentist {
  _id: string
  name: string
  email: string
  specialization: string[]
  licenseNumber: string
  experience: number
  bio?: string
  consultationFee: number
  isAvailable: boolean
}

export interface Service {
  _id: string
  name: string
  description: string
  category: string
  duration: number
  price: number
}

export interface Appointment {
  _id: string
  patientId: string
  dentistId: {
    _id: string
    name: string
    email: string
    specialization: string[]
  }
  serviceId: {
    _id: string
    name: string
    category: string
    duration: number
    price: number
  }
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentData {
  dentistId: string
  serviceId: string
  date: string
  time: string
  notes?: string
}

interface PatientState {

  profile: PatientProfile | null

  appointments: Appointment[]
  upcomingAppointments: Appointment[]

  dentists: Dentist[]
  services: Service[]
  availableSlots: { date: string; time: string }[]

  isLoading: boolean
  isBooking: boolean

  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<PatientProfile>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  
  fetchAppointments: () => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<void>
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => Promise<void>
  
  fetchDentists: () => Promise<void>
  fetchServices: () => Promise<void>
  fetchDoctorAvailability: (dentistId: string, startDate?: string, endDate?: string) => Promise<{
    date: string
    timeSlots: { time: string; available: boolean }[]
  }[]>
  fetchAvailableSlots: (dentistId: string, date: string) => Promise<void>
  
  bookAppointment: (data: CreateAppointmentData) => Promise<void>
}

export const usePatientStore = create<PatientState>((set, get) => ({

  profile: null,
  appointments: [],
  upcomingAppointments: [],
  dentists: [],
  services: [],
  availableSlots: [],
  isLoading: false,
  isBooking: false,

  fetchProfile: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/auth/me')
      // Handle the API response structure where user data includes nested profile
      const userData = response.data.user
      set({ profile: userData })
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true })
    try {
      await axios.put('/auth/profile', data)
      // Fetch fresh profile data after update to get complete nested structure
      const response = await axios.get('/auth/me')
      const userData = response.data.user
      set({ profile: userData })
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true })
    try {
      await axios.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },


  fetchAppointments: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/patients/appointments')
      const appointments = response.data.appointments || []
      
      const upcoming = appointments.filter((apt: Appointment) => 
        ['pending', 'confirmed'].includes(apt.status) && 
        new Date(`${apt.date}T${apt.time}`) > new Date()
      )
      
      set({ 
        appointments,
        upcomingAppointments: upcoming
      })
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  cancelAppointment: async (appointmentId) => {
    try {
      await axios.patch(`/patients/appointments/${appointmentId}/cancel`)

      const { fetchAppointments } = get()
      await fetchAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      throw error
    }
  },

  rescheduleAppointment: async (appointmentId, newDate, newTime) => {
    try {
      await axios.patch(`/patients/appointments/${appointmentId}/reschedule`, {
        date: newDate,
        time: newTime
      })

      const { fetchAppointments } = get()
      await fetchAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      throw error
    }
  },

  // Booking data actions
  fetchDentists: async () => {
    set({ isLoading: true })
    try {
      // Try public endpoint first, fallback to protected endpoint
      let response
      try {
        response = await axios.get('/public/dentists')
      } catch (publicError) {
        // If public fails, try protected endpoint (for authenticated users)
        response = await axios.get('/patients/dentists')
      }
      set({ dentists: response.data.dentists || [] })
    } catch (error) {
      console.error('Error fetching dentists:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchServices: async () => {
    set({ isLoading: true })
    try {
      // Try public endpoint first, fallback to protected endpoint
      let response
      try {
        response = await axios.get('/public/services')
      } catch (publicError) {
        // If public fails, try protected endpoint (for authenticated users)
        response = await axios.get('/patients/services')
      }
      set({ services: response.data.services || [] })
    } catch (error) {
      console.error('Error fetching services:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchDoctorAvailability: async (dentistId: string, startDate?: string, endDate?: string) => {
    set({ isLoading: true })
    try {
      const params: { dentistId: string; startDate?: string; endDate?: string } = { dentistId }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
      
      // Try public endpoint first, fallback to protected endpoint
      let response
      try {
        response = await axios.get('/public/doctor-availability', { params })
      } catch (publicError) {
        // If public fails, try protected endpoint (for authenticated users)
        response = await axios.get('/patients/doctor-availability', { params })
      }
      return response.data.availability || []
    } catch (error) {
      console.error('Error fetching doctor availability:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAvailableSlots: async (dentistId, date) => {
    set({ isLoading: true })
    try {
      // Try public endpoint first, fallback to protected endpoint
      let response
      try {
        response = await axios.get(`/public/available-slots`, {
          params: { dentistId, date }
        })
      } catch (publicError) {
        // If public fails, try protected endpoint (for authenticated users)
        response = await axios.get(`/patients/available-slots`, {
          params: { dentistId, date }
        })
      }
      set({ availableSlots: response.data.slots || [] })
    } catch (error) {
      console.error('Error fetching available slots:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  bookAppointment: async (data) => {
    set({ isBooking: true })
    try {
      await axios.post('/patients/appointments', data)
      
      // Refresh appointments after booking
      const { fetchAppointments } = get()
      await fetchAppointments()
    } catch (error) {
      console.error('Error booking appointment:', error)
      throw error
    } finally {
      set({ isBooking: false })
    }
  },
}))