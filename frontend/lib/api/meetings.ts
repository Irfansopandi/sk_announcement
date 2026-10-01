import { fetchClient } from './client';
import { Meeting, PaginatedResponse, ApiResponse } from '../../types';

export interface MeetingParams {
  page?: number;
  per_page?: number;
  search?: string;
  year?: string;
  sort?: string;
  status?: 'draft' | 'published';
}

export const adminMeetingService = {
  getAll: async (params?: MeetingParams): Promise<PaginatedResponse<Meeting>> => {
    return fetchClient<PaginatedResponse<Meeting>>('/admin/meetings', { 
      method: 'GET',
      params: params as Record<string, string | number> 
    });
  },

  getById: async (id: number): Promise<ApiResponse<Meeting>> => {
    return fetchClient<ApiResponse<Meeting>>(`/admin/meetings/${id}`, {
      method: 'GET'
    });
  },

  create: async (data: FormData): Promise<ApiResponse<Meeting>> => {
    return fetchClient<ApiResponse<Meeting>>('/admin/meetings', {
      method: 'POST',
      body: data
    });
  },

  update: async (id: number, data: FormData): Promise<ApiResponse<Meeting>> => {
    return fetchClient<ApiResponse<Meeting>>(`/admin/meetings/${id}`, {
      method: 'POST',
      body: data
    });
  },

  delete: async (id: number): Promise<any> => {
    return fetchClient(`/admin/meetings/${id}`, {
      method: 'DELETE'
    });
  },

  updateStatus: async (id: number, status: 'draft' | 'published'): Promise<ApiResponse<Meeting>> => {
    return fetchClient<ApiResponse<Meeting>>(`/admin/meetings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

export const publicMeetingService = {
  getAll: async (params?: MeetingParams): Promise<PaginatedResponse<Meeting>> => {
    return fetchClient<PaginatedResponse<Meeting>>('/meetings', { 
      method: 'GET',
      params: params as Record<string, string | number> 
    });
  },

  getById: async (id: number): Promise<ApiResponse<Meeting>> => {
    return fetchClient<ApiResponse<Meeting>>(`/meetings/${id}`, {
      method: 'GET'
    });
  },
};
