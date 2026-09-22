import { fetchClient } from './client';
import { Document, ApiResponse } from '../../types';

export const adminDocumentService = {
  getAllByAnnouncement: async (announcementId: number): Promise<ApiResponse<Document[]>> => {
    return fetchClient<ApiResponse<Document[]>>(`/admin/announcements/${announcementId}/documents`, {
      method: 'GET',
    });
  },

  getById: async (documentId: number): Promise<ApiResponse<Document>> => {
    return fetchClient<ApiResponse<Document>>(`/admin/documents/${documentId}`, {
      method: 'GET',
    });
  },

  upload: async (announcementId: number, file: File): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);

    return fetchClient<ApiResponse<Document>>(`/admin/announcements/${announcementId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  delete: async (documentId: number): Promise<ApiResponse<null>> => {
    return fetchClient<ApiResponse<null>>(`/admin/documents/${documentId}`, {
      method: 'DELETE',
    });
  },
};
