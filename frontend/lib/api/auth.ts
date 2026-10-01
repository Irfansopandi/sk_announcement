import { fetchClient } from './client';
import { User } from '../../types';

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchClient<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<{ message: string }> => {
    return fetchClient<{ message: string }>('/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchClient<User>('/user', {
      method: 'GET',
    });
  },

  updateProfile: async (name: string, email: string): Promise<{ success: boolean; message: string; user: User }> => {
    return fetchClient('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
  },

  updatePassword: async (current_password: string, new_password: string, new_password_confirmation: string): Promise<{ success: boolean; message: string }> => {
    return fetchClient('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password, new_password, new_password_confirmation }),
    });
  }
};
