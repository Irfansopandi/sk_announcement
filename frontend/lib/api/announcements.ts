import { fetchClient } from './client';
import { Announcement, ApiResponse, PaginatedResponse } from '../../types';

export interface AnnouncementParams {
  search?: string;
  year?: string | number;
  sort?: string;
  page?: number;
  status?: 'draft' | 'published';
}

export const publicAnnouncementService = {
  getAll: async (params?: AnnouncementParams): Promise<PaginatedResponse<Announcement>> => {
    return fetchClient<PaginatedResponse<Announcement>>('/announcements', {
      method: 'GET',
      params: params as Record<string, string | number>,
    });
  },

  getById: async (id: number): Promise<ApiResponse<Announcement>> => {
    return fetchClient<ApiResponse<Announcement>>(`/announcements/${id}`, {
      method: 'GET',
    });
  },
};

export const adminAnnouncementService = {
  getAll: async (params?: AnnouncementParams): Promise<PaginatedResponse<Announcement>> => {
    return fetchClient<PaginatedResponse<Announcement>>('/admin/announcements', {
      method: 'GET',
      params: params as Record<string, string | number>,
    });
  },

  getById: async (id: number): Promise<ApiResponse<Announcement>> => {
    return fetchClient<ApiResponse<Announcement>>(`/admin/announcements/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: Partial<Announcement>): Promise<ApiResponse<Announcement>> => {
    return fetchClient<ApiResponse<Announcement>>('/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: Partial<Announcement>): Promise<ApiResponse<Announcement>> => {
    return fetchClient<ApiResponse<Announcement>>(`/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    return fetchClient<ApiResponse<null>>(`/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  updateStatus: async (id: number, status: 'draft' | 'published'): Promise<ApiResponse<Announcement>> => {
    return fetchClient<ApiResponse<Announcement>>(`/admin/announcements/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
