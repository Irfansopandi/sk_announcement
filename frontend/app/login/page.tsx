"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../lib/api/auth';
import { ApiError } from '../../lib/api/client';
import ParticleBackground from '../../components/ParticleBackground';
import { toastSuccess } from '../../lib/swal';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8F5]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#059669] border-t-transparent mx-auto"></div>
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
      toastSuccess('Selamat datang, ' + response.user.name + '!');
      router.replace('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(err.message || 'Email atau password tidak sesuai.');
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

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-[#F7F8F5] to-yellow-50 px-4 py-12 sm:px-6 lg:px-8 font-sans overflow-hidden"
    >
      
      {/* Interactive Particle Background */}
      <ParticleBackground />
      
      <div className="relative z-10 w-full max-w-lg space-y-8 bg-white/20 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-white/40">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-28 w-auto max-w-[10rem] flex items-center justify-center mb-0 -mt-4">
            <img 
              src="/2.png" 
              alt="ISURA Logo" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <h2 className="text-xl sm:text-[1.35rem] font-bold tracking-tight leading-tight -mt-1">
            <span className="block whitespace-nowrap text-4xl font-black bg-gradient-to-r from-[#c89c46] to-[#096F9A] bg-clip-text text-transparent">ISURA</span>
            <span className="block text-[#c89c46] text-sm -mt-0.5">Informasi Surat Keputusan & Rapat</span>
            <span className="block text-[#4B5563] text-sm">Pengadilan Agama Karawang</span>
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
                className="block w-full rounded-lg border border-[#E5E7E1] px-4 py-3 text-[#1F2937] placeholder-[#98A2B3] focus:border-[#c89c46] focus:outline-none focus:ring-1 focus:ring-[#c89c46] sm:text-sm transition-colors bg-white/70 focus:bg-white"
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
                  className="block w-full rounded-lg border border-[#E5E7E1] pl-4 pr-11 py-3 text-[#1F2937] placeholder-[#98A2B3] focus:border-[#c89c46] focus:outline-none focus:ring-1 focus:ring-[#c89c46] sm:text-sm transition-colors bg-white/70 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 z-20 flex items-center pr-3.5 text-[#98A2B3] hover:text-[#4B5563] focus:outline-none cursor-pointer transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="group relative flex w-full justify-center rounded-lg bg-[#c89c46] px-4 py-3 text-sm font-semibold text-[#FFFFFF] hover:bg-[#b0873a] shadow-md focus:outline-none focus:ring-2 focus:ring-[#c89c46] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
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
