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
};
