"use client";

import { useAuth } from '../../contexts/AuthContext';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  description?: string;
}

export default function Header({ onMenuClick, title: propTitle, description }: HeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  let title = propTitle || 'Dashboard';
  if (!propTitle) {
    if (pathname?.includes('/admin/announcements')) {
      title = 'Surat Keputusan';
    } else if (pathname?.includes('/admin/notulensi')) {
      title = 'Rapat';
    } else if (pathname?.includes('/admin/profile')) {
      title = 'Profil Admin';
    }
  }

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5E7E1] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-10">
      
      {/* Mobile menu button & Title area */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-[#4B5563] hover:bg-[#F7F8F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#096F9A]"
          aria-label="Buka menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:block">
          <div>
            <h1 className="text-xl font-semibold text-[#1F2937] leading-tight">{title}</h1>
            {description && <p className="text-sm text-[#4B5563]">{description}</p>}
          </div>
        </div>
      </div>

      {/* Right side - User info */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-[#1F2937]">{user?.name || 'Admin'}</p>
          <p className="text-xs text-[#4B5563]">{user?.email}</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-[#F0F8FB] text-[#096F9A] flex items-center justify-center font-bold border border-[#096F9A]/20">
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
      
    </header>
  );
}
