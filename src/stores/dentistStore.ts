import { create } from 'zustand';
import api from '@/lib/axios';

export interface DentistProfile {
  _id: string;
  userId: string;
  licenseNumber: string;
  specialization: string[];
  experience: number;
  consultationFee: number;
  bio: string;
  education: string[];
  isActive: boolean;
  joinedDate: string;
  schedule?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
}

export interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  profile?: {
    phone?: string;
    birthdate?: string;
    gender?: string;
    address?: string;
  };
  createdAt: string;
  lastVisit?: string;
  totalAppointments?: number;
}

export interface Appointment {
  _id: string;
  patientId: Patient;
  dentistId: string;
  serviceId: {
    _id: string;
    name: string;
    category: string;
  };
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  patientId: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export interface UpdateProfileData {
  licenseNumber?: string;
  specialization?: string[];
  experience?: number;
  consultationFee?: number;
  bio?: string;
  education?: string[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface DentistState {
  profile: DentistProfile | null;
  patients: Patient[];
  appointments: Appointment[];
  services: {
    _id: string
    name: string
    category: string
    description: string
    defaultDuration: number
    defaultPrice: number
  }[];
  isLoading: boolean;
  
  // Profile management
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  
  // Patient management
  fetchPatients: () => Promise<void>;
  fetchAllPatients: () => Promise<Patient[]>;
  
  // Appointment management
  fetchAppointments: (filters?: { date?: string; status?: string }) => Promise<void>;
  createAppointment: (data: CreateAppointmentData) => Promise<void>;
  updateAppointment: (appointmentId: string, data: Partial<CreateAppointmentData>) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => Promise<void>;
  
  // Service management
  fetchMyServices: () => Promise<void>;
}

export const useDentistStore = create<DentistState>((set, get) => ({
  profile: null,
  patients: [],
  appointments: [],
  services: [],
  isLoading: false,

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/dentists/profile');
      set({ profile: response.data.data });
    } catch (error) {
      console.error('Failed to fetch dentist profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    try {
      set({ isLoading: true });
      const response = await api.put('/dentists/profile', data);
      set({ profile: response.data.data });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (data: ChangePasswordData) => {
    try {
      set({ isLoading: true });
      await api.put('/auth/change-password', data);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPatients: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/dentists/patients');
      const patients = Array.isArray(response.data.patients) ? response.data.patients : [];
      set({ patients });
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      set({ patients: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllPatients: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/dentists/all-patients');
      return Array.isArray(response.data.patients) ? response.data.patients : [];
    } catch (error) {
      console.error('Failed to fetch all patients:', error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAppointments: async (filters = {}) => {
    try {
      set({ isLoading: true });
      const params = new URLSearchParams();
      
      if (filters.date) {
        params.append('date', filters.date);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }

      const response = await api.get(`/dentists/appointments?${params}`);
      const appointments = Array.isArray(response.data.appointments) ? response.data.appointments : [];
      console.log('Dentist appointments fetched:', appointments.length, 'appointments');
      console.log('Pending appointments:', appointments.filter((apt: Appointment) => apt.status === 'pending').length);
      set({ appointments });
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      set({ appointments: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createAppointment: async (data: CreateAppointmentData) => {
    try {
      set({ isLoading: true });
      await api.post('/dentists/appointments', data);
      // Refresh appointments after creating
      await get().fetchAppointments();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAppointment: async (appointmentId: string, data: Partial<CreateAppointmentData>) => {
    try {
      set({ isLoading: true });
      await api.put(`/dentists/appointments/${appointmentId}`, data);
      // Refresh appointments after updating
      await get().fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAppointmentStatus: async (appointmentId: string, status: Appointment['status']) => {
    try {
      set({ isLoading: true });
      await api.put(`/dentists/appointments/${appointmentId}/status`, { status });
      
      // Update the appointment in the current state
      const currentAppointments = get().appointments;
      const updatedAppointments = currentAppointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status } : apt
      );
      set({ appointments: updatedAppointments });
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyServices: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/dentists/services');
      const services = Array.isArray(response.data.services) ? response.data.services : [];
      set({ services });
    } catch (error) {
      console.error('Failed to fetch services:', error);
      set({ services: [] });
    } finally {
      set({ isLoading: false });
    }
  }
}));