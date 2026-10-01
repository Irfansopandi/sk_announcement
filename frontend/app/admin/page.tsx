"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { adminAnnouncementService } from '../../lib/api/announcements';
import { Announcement, Meeting } from '../../types';
import { adminMeetingService } from '../../lib/api/meetings';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [recentSKs, setRecentSKs] = useState<Announcement[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState({
    totalSKPerTahun: 0,
    semuaSK: 0,
    totalRapatPerTahun: 0,
    semuaRapat: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [bubbles, setBubbles] = useState<any[]>([]);

  useEffect(() => {
    // Clock interval
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Bubble properties generated once on mount
    setBubbles(Array.from({ length: 8 }).map(() => ({
      width: `${Math.random() * 60 + 20}px`,
      height: `${Math.random() * 60 + 20}px`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 4 + 4}s`,
      animationDelay: `${Math.random() * 3}s`
    })));
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const currentYear = new Date().getFullYear();
        const yearRes = await adminAnnouncementService.getAll({ year: currentYear.toString(), page: 1 });
        const allRes = await adminAnnouncementService.getAll({ sort: 'tanggal terbaru', page: 1 });
        
        const yearMeetingRes = await adminMeetingService.getAll({ year: currentYear.toString(), page: 1 });
        const allMeetingRes = await adminMeetingService.getAll({ sort: 'tanggal terbaru', page: 1 });
        
        setRecentSKs(allRes.data?.data.slice(0, 5) || []); 
        setRecentMeetings(allMeetingRes.data?.data.slice(0, 5) || []);
        
        setStats({
          totalSKPerTahun: yearRes.data?.total || 0,
          semuaSK: allRes.data?.total || 0,
          totalRapatPerTahun: yearMeetingRes.data?.total || 0,
          semuaRapat: allMeetingRes.data?.total || 0,
        });

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="sm:hidden mb-4">
        <h1 className="text-xl font-semibold text-[#1F2937]">Dashboard</h1>
      </div>

      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#096F9A] via-[#0A85B8] to-[#07587B] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        {/* Bubbles Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {bubbles.map((style, i) => (
            <div 
              key={i} 
              className="absolute bg-white/10 rounded-full"
              style={{
                width: style.width,
                height: style.height,
                left: style.left,
                bottom: '-80px',
                animation: `float ${style.animationDuration} infinite linear ${style.animationDelay}`
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Selamat datang kembali, {user?.name}</h2>
          <p className="text-[#E6F3F9] text-sm sm:text-base max-w-xl">
            Kelola dan pantau pengumuman Surat Keputusan dengan lebih mudah dan cepat melalui panel admin ini.
          </p>
        </div>
        
        {/* Live Clock */}
        <div className="relative z-10 shrink-0 text-right bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 shadow-inner min-w-[200px]">
          {currentTime ? (
            <>
              <p className="text-xs text-[#E6F3F9] mb-1 font-medium tracking-widest uppercase">Waktu Saat Ini</p>
              <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-center justify-end gap-1">
                <span>{String(currentTime.getHours()).padStart(2, '0')}</span>
                <span className="text-white/50 animate-pulse">:</span>
                <span>{String(currentTime.getMinutes()).padStart(2, '0')}</span>
                <span className="text-white/50 animate-pulse">:</span>
                <span className="text-[#E5A822]">{String(currentTime.getSeconds()).padStart(2, '0')}</span>
              </div>
              <p className="text-sm text-white/80 mt-1">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </>
          ) : (
            <div className="h-[72px] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0; }
            20% { opacity: 0.6; }
            80% { opacity: 0.3; }
            100% { transform: translateY(-250px) scale(1.5) rotate(45deg); opacity: 0; }
          }
        `}} />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* SK Per Tahun */}
        <div className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-gradient-to-br from-[#F0F8FB] to-[#E6F3F9] border border-[#096F9A]/20 hover:border-[#096F9A]/60 hover:shadow-md cursor-pointer">
          <div className="p-3 bg-[#D9EDF7] text-[#096F9A] rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1 whitespace-nowrap">Total SK Per Tahun</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-[#096F9A]/10 animate-pulse rounded"></div> : stats.totalSKPerTahun}
            </h3>
            <p className="text-xs text-[#6B7C87] mt-1">Tahun {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Semua SK */}
        <div className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-gradient-to-br from-[#F0F8FB] to-[#E6F3F9] border border-[#096F9A]/20 hover:border-[#096F9A]/60 hover:shadow-md cursor-pointer">
          <div className="p-3 bg-[#D9EDF7] text-[#096F9A] rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1 whitespace-nowrap">Semua SK Terdaftar</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-[#096F9A]/10 animate-pulse rounded"></div> : stats.semuaSK}
            </h3>
            <p className="text-xs text-[#6B7C87] mt-1">Keseluruhan</p>
          </div>
        </div>

        {/* Rapat Per Tahun */}
        <div className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-gradient-to-br from-[#FDF5DF] to-[#FBEBC3] border border-[#E5A822]/20 hover:border-[#E5A822]/60 hover:shadow-md cursor-pointer">
          <div className="p-3 bg-[#F9E0A2] text-[#C28B15] rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1 whitespace-nowrap">Total Rapat Per Tahun</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-[#E5A822]/10 animate-pulse rounded"></div> : stats.totalRapatPerTahun}
            </h3>
            <p className="text-xs text-[#6B7C87] mt-1">Tahun {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Semua Rapat */}
        <div className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-gradient-to-br from-[#FDF5DF] to-[#FBEBC3] border border-[#E5A822]/20 hover:border-[#E5A822]/60 hover:shadow-md cursor-pointer">
          <div className="p-3 bg-[#F9E0A2] text-[#C28B15] rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1 whitespace-nowrap">Semua Rapat Terdaftar</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-[#E5A822]/10 animate-pulse rounded"></div> : stats.semuaRapat}
            </h3>
            <p className="text-xs text-[#6B7C87] mt-1">Keseluruhan</p>
          </div>
        </div>

      </div>

      {/* Recent Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-8">
        
        {/* SK Terbaru */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E7E1] shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1F2937]">SK Terbaru</h3>
            <Link href="/admin/announcements" className="text-sm font-medium text-[#096F9A] hover:text-[#07587B]">
              Lihat Semua &rarr;
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 border border-transparent">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentSKs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F5F7F8] rounded-xl border border-dashed border-[#CFDFE8]">
                <p className="text-sm font-medium text-[#6B7C87]">Belum ada Surat Keputusan terdaftar.</p>
              </div>
            ) : (
              recentSKs.map((sk) => (
                <Link key={sk.id} href={`/admin/announcements/${sk.id}`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors border border-transparent hover:border-[#E5E7E1]">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F8FB] text-[#096F9A] flex items-center justify-center shrink-0 group-hover:bg-[#096F9A] group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-[#6B7C87]">
                        {new Date(sk.sk_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {sk.status === 'published' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0F8FB] text-[#096F9A] border border-[#096F9A]/20">Publish</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Rahasia</span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#1F2937] truncate group-hover:text-[#096F9A] transition-colors mb-0.5">{sk.sk_number}</h4>
                    <p className="text-xs text-[#6B7C87] line-clamp-1">
                      {sk.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Rapat Terbaru */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E5E7E1] shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1F2937]">Rapat Terbaru</h3>
            <Link href="/admin/notulensi" className="text-sm font-medium text-[#E5A822] hover:text-[#C28B15]">
              Lihat Semua &rarr;
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[450px]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 border border-transparent">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : recentMeetings.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#98A2B3]">Belum ada rapat baru.</p>
              </div>
            ) : (
              recentMeetings.map((item) => (
                <Link key={item.id} href={`/admin/notulensi/${item.id}`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors border border-transparent hover:border-[#E5E7E1]">
                  <div className="w-10 h-10 rounded-lg bg-[#FDF5DF] text-[#E5A822] flex items-center justify-center shrink-0 group-hover:bg-[#E5A822] group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-[#6B7C87]">
                        {new Date(item.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {item.status === 'published' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0F8FB] text-[#096F9A] border border-[#096F9A]/20">Publish</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">Rahasia</span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-[#1F2937] truncate group-hover:text-[#E5A822] transition-colors mb-0.5">{item.invitation_number}</h4>
                    <p className="text-xs text-[#6B7C87] line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F5F7F8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CFDFE8;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A6C0CF;
        }
      `}} />
    </div>
  );
}
