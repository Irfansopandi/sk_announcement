"use client";

import { useState, useEffect } from 'react';
import { authService } from '../../../lib/api/auth';
import { useAuth } from '../../../contexts/AuthContext';
import Swal from 'sweetalert2';
import DocumentTitleUpdater from '../../../components/DocumentTitleUpdater';

export default function ProfilePage() {
  const { user: currentUser, login } = useAuth();
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await authService.updateProfile(name, email);
      
      // Update local storage user data silently
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        storedUser.name = name;
        storedUser.email = email;
        localStorage.setItem('user', JSON.stringify(storedUser));
        window.dispatchEvent(new Event('storage'));
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Informasi pribadi berhasil diperbarui',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: err.message || 'Gagal memperbarui profil',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Konfirmasi kata sandi tidak cocok',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      setIsSavingPassword(true);
      await authService.updatePassword(currentPassword, newPassword, confirmPassword);
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Kata sandi berhasil diperbarui',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: err.message || 'Gagal memperbarui kata sandi',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <DocumentTitleUpdater />
      
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Profil Saya</h1>
        <p className="text-sm text-[#4B5563] mt-1">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E7E1] shadow-sm">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-6 border-b border-[#E5E7E1] pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#096F9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Informasi Pribadi
          </h2>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#096F9A] focus:border-transparent text-[#1F2937] transition-all"
                placeholder="Masukkan nama"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#096F9A] focus:border-transparent text-[#1F2937] transition-all"
                placeholder="Masukkan email"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#096F9A] hover:bg-[#065A7F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#096F9A] transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E7E1] shadow-sm">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-6 border-b border-[#E5E7E1] pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Ubah Kata Sandi
          </h2>
          
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#096F9A] focus:border-transparent text-[#1F2937] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#096F9A] focus:border-transparent text-[#1F2937] transition-all"
                placeholder="Minimal 8 karakter"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7E1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#096F9A] focus:border-transparent text-[#1F2937] transition-all"
                placeholder="Ulangi kata sandi baru"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isSavingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
