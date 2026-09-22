/**
 * Token Storage Abstraction
 * Currently uses localStorage for development convenience.
 * Can be easily swapped to httpOnly cookies in production by updating this file 
 * and using Next.js server actions / api routes.
 */

const TOKEN_KEY = 'sk_auth_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};
