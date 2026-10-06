"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Surat Keterangan', href: '/admin/announcements', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    )},
    { name: 'Rapat', href: '/admin/notulensi', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { name: 'Profil Admin', href: '/admin/profile', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )}
  ];

  return (
    <>
      {/* Logout blur overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all">
          <div className="flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-12 w-12 text-[#096F9A]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm font-semibold text-[#14232E] tracking-wide">Sedang keluar...</p>
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#FFFFFF] border-r border-[#E5E7E1] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          
          {/* Logo Area */}
          <div className="h-16 flex items-center px-4 border-b border-[#E5E7E1] overflow-visible">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center relative shrink-0">
                <img 
                  src="/2.png" 
                  alt="ISURA Logo" 
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-[#c89c46] to-[#096F9A] bg-clip-text text-transparent leading-none tracking-tight">
                  ISURA
                </span>
                <span className="text-[8.5px] font-bold text-[#c89c46] -mt-0.5 whitespace-nowrap">
                  Informasi Surat Keputusan & Rapat
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-[#F0F8FB] text-[#096F9A]' 
                      : 'text-[#4B5563] hover:bg-[#F7F8F5] hover:text-[#1F2937]'
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-[#E5E7E1]">
            <button
              onClick={async () => {
                const result = await Swal.fire({
                  title: 'Keluar dari Admin Panel?',
                  text: 'Anda akan diarahkan ke halaman login.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#dc2626',
                  cancelButtonColor: '#6b7280',
                  confirmButtonText: 'Ya, Logout',
                  cancelButtonText: 'Batal',
                  width: '360px',
                  padding: '1.5rem',
                  customClass: {
                    popup: '!rounded-2xl',
                    title: '!text-lg',
                    htmlContainer: '!text-sm',
                  },
                });
                if (result.isConfirmed) {
                  setIsLoggingOut(true);
                  await new Promise(r => setTimeout(r, 1200));
                  logout();
                }
              }}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
