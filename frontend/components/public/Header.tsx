"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarIcon, MenuIcon, XIcon, LayoutDashboardIcon, FileTextIcon, InfoIcon } from 'lucide-react';

export default function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      
      const dateString = date.toLocaleDateString('id-ID', dateOptions);
      // Ensure time uses colons instead of periods for id-ID locale
      const timeString = date.toLocaleTimeString('id-ID', timeOptions).replace(/\./g, ':');
      
      setCurrentDate(`${dateString} - ${timeString}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
    { name: 'Surat Keputusan', href: '/pengumuman', icon: FileTextIcon },
    { name: 'Rapat', href: '/notulensi', icon: FileTextIcon },
    { name: 'Tentang', href: '/tentang', icon: InfoIcon },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md border-b border-transparent' : 'border-b border-[#E5E7E1]'}`}>
      
      {/* Background Layer */}
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-lg' : 'bg-white/95'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          
          {/* Left section: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 ml-4 sm:ml-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative">
                <img 
                  src="/logo1_transparent.png" 
                  alt="ISKN Logo" 
                  className="w-full h-full object-contain absolute inset-0 scale-110 sm:scale-125 drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0';
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Center section: Navigation */}
          <nav className="hidden md:flex items-center h-full space-x-2 lg:space-x-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3 h-full transition-all duration-200 group ${
                    isActive ? 'text-[#12333D]' : 'text-[#6B7C87] hover:text-[#12333D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-[#A6C0CF] group-hover:text-[#D4AF37]'}`} />
                  
                  <div className="relative flex items-center h-full">
                    <span className="text-sm font-bold tracking-wide">{item.name}</span>
                    
                    {/* Active Indicator Line */}
                    <div className={`absolute bottom-[22px] left-0 w-full h-[3px] rounded-full transition-all duration-300 ${
                      isActive ? 'bg-[#D4AF37] opacity-100 scale-x-100' : 'bg-[#D4AF37] opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100'
                    }`} />
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right section: Date & Mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-[#14232E]">
              <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-bold">{currentDate || 'Memuat tanggal...'}</span>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-[#6B7C87] hover:text-[#14232E] hover:bg-[#F5F7F8] transition-colors focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Buka menu utama</span>
                {!isMobileMenuOpen ? (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <XIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#E5E7E1] shadow-xl absolute w-full left-0 z-50" id="mobile-menu">
          <div className="px-4 pt-4 pb-2 border-b border-[#E5E7E1] flex items-center gap-2 text-[#14232E] font-bold">
             <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
             <span className="text-sm">{currentDate || 'Memuat tanggal...'}</span>
          </div>
          <div className="px-2 pt-2 pb-4 space-y-1 mt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-bold transition-colors ${
                    isActive 
                      ? 'bg-[#F5F7F8] text-[#12333D] border-l-4 border-[#D4AF37]' 
                      : 'text-[#6B7C87] hover:bg-[#F5F7F8] hover:text-[#12333D] border-l-4 border-transparent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#D4AF37]' : 'text-[#A6C0CF]'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

