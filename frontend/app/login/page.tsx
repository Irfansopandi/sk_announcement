"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8F5]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#266210] border-t-transparent mx-auto"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.user.role !== 'admin') {
        setError('Akses ditolak. Anda bukan admin.');
        setIsSubmitting(false);
        return;
      }

      login(response.token, response.user);
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Email atau password tidak sesuai.');
        } else if (err.status === 422) {
          setError('Mohon periksa kembali input Anda.');
        } else if (err.status === 403) {
          setError('Akses ditolak.');
        } else {
          setError('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
        }
      } else {
        setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      }
      setIsSubmitting(false);
    }
  };

  const bubbles = [
    { id: 1, size: 'w-16 h-16', color: 'bg-[#266210] border-[#266210]', top: '10%', left: '15%', delay: '0s', speed: 1.5 },
    { id: 2, size: 'w-10 h-10', color: 'bg-[#FFD51E] border-[#FFD51E]', top: '25%', left: '75%', delay: '2s', speed: -1.2 },
    { id: 3, size: 'w-12 h-12', color: 'bg-[#266210] border-[#266210]', top: '65%', left: '10%', delay: '1s', speed: 2 },
    { id: 4, size: 'w-24 h-24', color: 'bg-[#FFD51E] border-[#FFD51E]', top: '75%', left: '80%', delay: '4s', speed: -1.8 },
    { id: 5, size: 'w-8 h-8', color: 'bg-[#266210] border-[#266210]', top: '15%', left: '50%', delay: '3s', speed: 0.8 },
    { id: 6, size: 'w-14 h-14', color: 'bg-[#FFD51E] border-[#FFD51E]', top: '85%', left: '40%', delay: '1.5s', speed: -0.5 },
    { id: 7, size: 'w-20 h-20', color: 'bg-[#266210] border-[#266210]', top: '45%', left: '85%', delay: '2.5s', speed: 1.1 },
    { id: 8, size: 'w-12 h-12', color: 'bg-[#FFD51E] border-[#FFD51E]', top: '35%', left: '20%', delay: '0.5s', speed: -1.5 },
  ];

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-[#F7F8F5] to-yellow-50 px-4 py-12 sm:px-6 lg:px-8 font-sans overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute transition-transform duration-100 ease-out"
            style={{
              top: bubble.top,
              left: bubble.left,
              transform: `translate(${mousePos.x * bubble.speed}px, ${mousePos.y * bubble.speed}px)`,
            }}
          >
            <div
              className={`rounded-full border shadow-sm ${bubble.size} ${bubble.color}`}
              style={{
                animation: `float 6s ease-in-out infinite ${bubble.delay}`,
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-md space-y-8 bg-[#FFFFFF] p-8 sm:p-10 rounded-2xl shadow-sm border border-[#E5E7E1]">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-[#266210] text-[#FFFFFF] flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1F2937] leading-tight">
            Sistem Pengumuman<br />Surat Keputusan PA Karawang
          </h2>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-[#1F2937] mb-1">
                Alamat Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-lg border border-[#E5E7E1] px-4 py-3 text-[#1F2937] placeholder-[#98A2B3] focus:z-10 focus:border-[#266210] focus:outline-none focus:ring-1 focus:ring-[#266210] sm:text-sm transition-colors"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1F2937] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-lg border border-[#E5E7E1] pl-4 pr-10 py-3 text-[#1F2937] placeholder-[#98A2B3] focus:z-10 focus:border-[#266210] focus:outline-none focus:ring-1 focus:ring-[#266210] sm:text-sm transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#98A2B3] hover:text-[#4B5563] focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="group relative flex w-full justify-center rounded-lg bg-[#266210] px-4 py-3 text-sm font-semibold text-[#FFFFFF] hover:bg-[#1E4F0D] focus:outline-none focus:ring-2 focus:ring-[#266210] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
