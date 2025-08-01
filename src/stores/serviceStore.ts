import { create } from 'zustand';
import api from '@/lib/axios';

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  defaultDuration: number;
  defaultPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DentistService {
  _id: string;
  dentistId: string;
  serviceId: Service;
  customPrice: number;
  customDuration: number;
  isOffered: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  defaultDuration: number;
  defaultPrice: number;
}

export interface ServiceUpdateData {
  name?: string;
  description?: string;
  category?: string;
  defaultDuration?: number;
  defaultPrice?: number;
  isActive?: boolean;
}

export interface ServiceAssignmentData {
  dentistId: string;
  serviceId: string;
  customPrice?: number;
  customDuration?: number;
  notes?: string;
}

interface ServiceState {
  services: Service[];
  dentistServices: DentistService[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchServices: (filters?: { category?: string; page?: number; limit?: number }) => Promise<void>;
  createService: (data: ServiceFormData) => Promise<void>;
  updateService: (serviceId: string, data: ServiceUpdateData) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  assignServiceToDentist: (data: ServiceAssignmentData) => Promise<void>;
  fetchDentistServices: (dentistId: string, filters?: { page?: number; limit?: number }) => Promise<void>;
  removeServiceFromDentist: (dentistId: string, serviceId: string) => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  dentistServices: [],
  isLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },

  fetchServices: async (filters = {}) => {
    try {
      set({ isLoading: true });
      const params = new URLSearchParams();
      
      if (filters.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await api.get(`/admin/services?${params}`);
      const services = Array.isArray(response.data.services) ? response.data.services : [];
      const pagination = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
      
      set({ services, pagination });
    } catch (error) {
      console.error('Failed to fetch services:', error);
      set({ services: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    } finally {
      set({ isLoading: false });
    }
  },

  createService: async (data: ServiceFormData) => {
    try {
      set({ isLoading: true });
      await api.post('/admin/services', data);
      await get().fetchServices();
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateService: async (serviceId: string, data: ServiceUpdateData) => {
    try {
      set({ isLoading: true });
      await api.put(`/admin/services/${serviceId}`, data);
      await get().fetchServices();
    } catch (error) {
      console.error('Failed to update service:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteService: async (serviceId: string) => {
    try {
      set({ isLoading: true });
      await api.delete(`/admin/services/${serviceId}`);
      
      const currentServices = get().services;
      set({
        services: currentServices.filter(service => service._id !== serviceId)
      });
    } catch (error) {
      console.error('Failed to delete service:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  assignServiceToDentist: async (data: ServiceAssignmentData) => {
    try {
      set({ isLoading: true });
      await api.post('/admin/services/assign', data);
    } catch (error) {
      console.error('Failed to assign service to dentist:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDentistServices: async (dentistId: string, filters = {}) => {
    try {
      set({ isLoading: true });
      const params = new URLSearchParams();
      
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await api.get(`/admin/dentists/${dentistId}/services?${params}`);
      const dentistServices = Array.isArray(response.data.services) ? response.data.services : [];
      const pagination = response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
      
      set({ dentistServices, pagination });
    } catch (error) {
      console.error('Failed to fetch dentist services:', error);
      set({ dentistServices: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    } finally {
      set({ isLoading: false });
    }
  },

  removeServiceFromDentist: async (dentistId: string, serviceId: string) => {
    try {
      set({ isLoading: true });
      await api.delete(`/admin/dentists/${dentistId}/services/${serviceId}`);
      
      const currentDentistServices = get().dentistServices;
      set({
        dentistServices: currentDentistServices.filter(ds => ds.serviceId._id !== serviceId)
      });
    } catch (error) {
      console.error('Failed to remove service from dentist:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));