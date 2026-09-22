"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../lib/api/auth';
import { getToken, setToken as saveToken, removeToken as deleteToken } from '../lib/auth/token';
import { ApiError } from '../lib/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to authenticate:', error);
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            deleteToken();
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    saveToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (getToken()) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      deleteToken();
      setUser(null);
      localStorage.removeItem('last_activity');
    }
  };

  useEffect(() => {
    if (!user) return;

    const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
    
    const updateActivity = () => {
      localStorage.setItem('last_activity', Date.now().toString());
    };

    updateActivity();

    const intervalId = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('last_activity') || '0', 10);
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        logout();
        alert('Sesi Anda telah habis karena tidak ada aktivitas selama 2 jam. Silakan login kembali.');
      }
    }, 60000); // Check every minute

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let timeout: NodeJS.Timeout;
    
    const handleUserActivity = () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateActivity, 1000);
    };

    events.forEach(e => window.addEventListener(e, handleUserActivity));

    return () => {
      clearInterval(intervalId);
      events.forEach(e => window.removeEventListener(e, handleUserActivity));
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
