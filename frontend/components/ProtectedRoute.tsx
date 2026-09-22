"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = true }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (requireAdmin && user?.role !== 'admin') {
        // Technically we only have 'admin' role, but just in case
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#266210] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4B5563]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
