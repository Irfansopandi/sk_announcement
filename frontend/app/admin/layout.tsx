"use client";

import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="flex h-screen bg-[#F7F8F5] overflow-hidden font-sans">
        
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
      </div>
    </ProtectedRoute>
  );
}
