"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Pengumuman', href: '/announcements' },
  ];

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E5E7E1] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section: Logo & Desktop Menu */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/announcements" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#266210] to-[#3A9418] flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-[#1F2937] tracking-tight hidden sm:block">Portal SK</span>
              </Link>
            </div>
            
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'border-[#266210] text-[#1F2937]' 
                        : 'border-transparent text-[#4B5563] hover:text-[#1F2937] hover:border-[#E5E7E1]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right section: Login Button */}
          <div className="hidden sm:flex sm:items-center">
            <Link 
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-[#FFFFFF] bg-[#266210] hover:bg-[#3A9418] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#266210]"
            >
              Login Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F7F8F5] transition-colors focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Buka menu utama</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E5E7E1] bg-[#FFFFFF]" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive 
                      ? 'border-[#266210] text-[#266210] bg-[#EEF5EA]' 
                      : 'border-transparent text-[#4B5563] hover:bg-[#F7F8F5] hover:border-[#E5E7E1] hover:text-[#1F2937]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-4 border-t border-[#E5E7E1] px-4">
            <Link 
              href="/login"
              className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-[#FFFFFF] bg-[#266210] hover:bg-[#3A9418] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
