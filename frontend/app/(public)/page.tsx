"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileTextIcon, 
  CalendarIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ClockIcon,
  LayoutDashboardIcon
} from 'lucide-react';
import { publicAnnouncementService } from '../../lib/api/announcements';
import { Announcement } from '../../types';

export default function DashboardPage() {
  const [allSKsForYear, setAllSKsForYear] = useState<Announcement[]>([]);
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);
  const [yearSK, setYearSK] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [greeting, setGreeting] = useState('Selamat Datang');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting('Selamat Pagi');
    } else if (hour >= 11 && hour < 15) {
      setGreeting('Selamat Siang');
    } else if (hour >= 15 && hour < 18) {
      setGreeting('Selamat Sore');
    } else {
      setGreeting('Selamat Malam');
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Reset selected date when year changes
        setSelectedFilterDate(null);

        // Fetch all SKs for the currently viewed calendar year
        const yearRes = await publicAnnouncementService.getAll({ year: currentDate.getFullYear(), limit: 1000 });
        if (yearRes.success && yearRes.data) {
          setAllSKsForYear(yearRes.data.data);
          setYearSK(yearRes.data.total);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate.getFullYear()]); // Refetch if calendar year changes

  // Mock Notulensi data (since API might not be ready)
  // We'll create some mock data in the current month to show the functionality
  const [allNotulensiForYear] = useState<any[]>([
    {
      id: 1,
      title: "Rapat Koordinasi Bulanan",
      sk_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-15`,
      description: "Pembahasan evaluasi kinerja dan target bulan depan."
    },
    {
      id: 2,
      title: "Rapat Paripurna",
      sk_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-20`,
      description: "Pengesahan draft keputusan tahunan."
    }
  ]);

  // Filter logic based on calendar selection
  const getFilteredSKs = () => {
    if (selectedFilterDate) {
      // Exact date match (Show ALL for this date, no slice)
      return allSKsForYear.filter(sk => {
        const skDateOnly = sk.sk_date.split('T')[0].split(' ')[0];
        return skDateOnly === selectedFilterDate;
      }).sort((a,b) => new Date(b.sk_date).getTime() - new Date(a.sk_date).getTime());
    } else {
      // Show ALL SKs for the currently viewed calendar month
      const monthSKs = allSKsForYear.filter(sk => {
        const d = new Date(sk.sk_date);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });
      return monthSKs.sort((a,b) => new Date(b.sk_date).getTime() - new Date(a.sk_date).getTime());
    }
  };

  const getFilteredNotulensi = () => {
    if (selectedFilterDate) {
      return allNotulensiForYear.filter(n => n.sk_date === selectedFilterDate);
    } else {
      return allNotulensiForYear.filter(n => {
        const d = new Date(n.sk_date);
        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
      });
    }
  };

  const latestSK = getFilteredSKs();
  const latestNotulensi = getFilteredNotulensi();

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust so Monday is 0
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDayActivities = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // Get all SKs for this date
    const daySKs = allSKsForYear.filter(sk => {
      const skDateOnly = sk.sk_date.split('T')[0].split(' ')[0];
      return skDateOnly === dateStr;
    });
    
    // Get all Notulensi for this date
    const dayNotulensi = allNotulensiForYear.filter(n => n.sk_date === dateStr);
    
    return { 
      skCount: daySKs.length, 
      notulensiCount: dayNotulensi.length, 
      dateStr 
    };
  };

  // Activity History mapping (combining SK and Notulensi)
  const historyItems = [
    ...latestSK.map(sk => ({
      id: `sk-${sk.id}`,
      type: 'SK',
      title: sk.description,
      date: sk.sk_date,
      link: `/pengumuman/${sk.id}`
    })),
    ...latestNotulensi.map(n => ({
      id: `notulensi-${n.id}`,
      type: 'Notulensi',
      title: n.title,
      date: n.sk_date,
      link: `/notulensi` // Placeholder
    }))
  ];

  const allActivities = [...historyItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-black text-white shadow-lg">
        <div className="absolute inset-0 z-0">
          {/* User should place their background image as hero-bg.jpg in public folder */}
          <img 
            src="/hero-bg.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              // Fallback to unsplash if local image not found
              e.currentTarget.src = "https://images.unsplash.com/photo-1541888040713-33e3d29831e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F2A]/90 via-[#0B1F2A]/70 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-12 lg:w-2/3">
          <p className="text-sm md:text-base font-bold text-[#D4AF37] tracking-wider uppercase mb-2">{greeting}</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white">
            Informasi Surat Keputusan<br />dan Notulensi Rapat
          </h1>
          <p className="text-[#CFDFE8] text-base md:text-lg max-w-xl leading-relaxed">
            Akses informasi terbaru mengenai Surat Keputusan (SK) dan hasil rapat secara transparan dan mudah.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SK Card */}
        <div className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-blue-50/60 border border-blue-200 hover:border-blue-500 hover:shadow-md hover:bg-blue-50">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">Total SK Per Tahun</p>
            {loading ? (
              <div className="h-8 w-16 bg-blue-200/50 rounded animate-pulse" />
            ) : (
              <h3 className="text-3xl font-bold text-slate-800">{yearSK}</h3>
            )}
            <p className="text-xs text-slate-500 mt-1">Total SK tahun {new Date().getFullYear()}</p>
          </div>
          <Link href="/pengumuman" className="text-blue-300 group-hover:text-blue-600 transition-colors self-center p-2">
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Notulensi Card */}
        <div className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-emerald-50/60 border border-emerald-200 hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Notulensi Per Tahun</p>
            <h3 className="text-3xl font-bold text-slate-800">{allNotulensiForYear.length}</h3>
            <p className="text-xs text-slate-500 mt-1">Total notulensi tahun {new Date().getFullYear()}</p>
          </div>
          <Link href="/notulensi" className="text-emerald-300 group-hover:text-emerald-600 transition-colors self-center p-2">
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Col: SK Terbaru */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7E1] flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-[#12333D]" />
              <h2 className="text-lg font-bold text-[#14232E]">SK Terbaru</h2>
            </div>
            <Link href="/pengumuman" className="text-sm font-medium text-[#2A75B3] hover:text-[#12333D] transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 -mr-2 custom-scrollbar max-h-[500px]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 border border-transparent">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : latestSK.length > 0 ? (
              latestSK.map((sk) => (
                <Link key={sk.id} href={`/pengumuman/${sk.id}`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors border border-transparent hover:border-[#E5E7E1]">
                  <div className="w-10 h-10 rounded-lg bg-[#EEF5FA] text-[#2A75B3] flex items-center justify-center shrink-0 group-hover:bg-[#2A75B3] group-hover:text-white transition-colors">
                    <FileTextIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-[#6B7C87]">
                        {new Date(sk.sk_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs font-semibold text-[#14232E] truncate">{sk.sk_number}</span>
                    </div>
                    <p className="text-sm text-[#14232E] font-medium line-clamp-2 leading-snug group-hover:text-[#2A75B3] transition-colors">
                      {sk.description}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#A6C0CF] group-hover:text-[#2A75B3] shrink-0 self-center transition-colors" />
                </Link>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F5F7F8] rounded-xl border border-dashed border-[#CFDFE8]">
                <FileTextIcon className="w-8 h-8 text-[#A6C0CF] mb-2" />
                <p className="text-sm font-medium text-[#6B7C87]">Belum ada Surat Keputusan yang tersedia.</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle Col: Notulensi Rapat */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7E1] flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#12333D]" />
              <h2 className="text-lg font-bold text-[#14232E]">Notulensi Rapat</h2>
            </div>
            <Link href="/notulensi" className="text-sm font-medium text-[#2A75B3] hover:text-[#12333D] transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 -mr-2 custom-scrollbar max-h-[500px]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 border border-transparent">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))
            ) : latestNotulensi.length > 0 ? (
              latestNotulensi.map((item) => (
                <Link key={item.id} href={`/notulensi`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors border border-transparent hover:border-[#E5E7E1]">
                  <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center shrink-0 group-hover:bg-[#7E22CE] group-hover:text-white transition-colors">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="block text-xs font-medium text-[#6B7C87] mb-1">
                        {new Date(item.sk_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    <h3 className="text-sm text-[#14232E] font-medium line-clamp-1 group-hover:text-[#7E22CE] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#6B7C87] mt-1 line-clamp-1">{item.description}</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#A6C0CF] group-hover:text-[#7E22CE] shrink-0 self-center transition-colors" />
                </Link>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F5F7F8] rounded-xl border border-dashed border-[#CFDFE8]">
                <CalendarIcon className="w-8 h-8 text-[#A6C0CF] mb-2" />
                <p className="text-sm font-medium text-[#6B7C87]">Belum ada notulensi rapat yang tersedia.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Kalender & History */}
        <div className="flex flex-col gap-6">
          {/* Calendar Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7E1]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#12333D]" />
                <h2 className="text-lg font-bold text-[#14232E]">Kalender</h2>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 bg-[#F5F7F8] p-2 rounded-lg">
               <button onClick={prevMonth} className="p-1 rounded hover:bg-white text-[#6B7C87] transition-colors"><ChevronLeftIcon className="w-5 h-5" /></button>
               <span className="font-semibold text-[#14232E] text-sm uppercase tracking-wide">
                 {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
               </span>
               <button onClick={nextMonth} className="p-1 rounded hover:bg-white text-[#6B7C87] transition-colors"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
                <div key={day} className="text-xs font-semibold text-[#6B7C87] py-1">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 text-transparent">0</div>
              ))}
              {days.map(day => {
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                const { skCount, notulensiCount, dateStr } = getDayActivities(day);
                
                return (
                  <div 
                    key={day} 
                    className="relative group p-1 cursor-pointer"
                    onClick={() => setSelectedFilterDate(selectedFilterDate === dateStr ? null : dateStr)}
                  >
                    <div className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all duration-200 ${
                      selectedFilterDate === dateStr 
                        ? 'bg-[#2A75B3] text-white font-bold shadow-md scale-110' 
                        : isToday 
                          ? 'bg-[#12333D] text-white font-bold' 
                          : 'text-[#14232E] hover:bg-[#F5F7F8] hover:scale-110'
                    }`}>
                      {day}
                    </div>
                    {/* Markers */}
                    {(skCount > 0 || notulensiCount > 0) && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {skCount > 0 && (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${selectedFilterDate === dateStr ? 'bg-white text-[#2A75B3]' : 'bg-[#2A75B3] text-white'}`} title={`${skCount} Surat Keputusan`}>
                            {skCount}
                          </div>
                        )}
                        {notulensiCount > 0 && (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${selectedFilterDate === dateStr ? 'bg-white text-[#7E22CE]' : 'bg-[#7E22CE] text-white'}`} title={`${notulensiCount} Notulensi Rapat`}>
                            {notulensiCount}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Activity History Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7E1] flex flex-col max-h-[400px]">
             <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-[#12333D]" />
                <h2 className="text-lg font-bold text-[#14232E]">Aktivitas Terbaru</h2>
              </div>
            </div>

            <div className="overflow-y-auto pr-2 -mr-2 space-y-4 flex-1 custom-scrollbar">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2 pb-4 border-b border-gray-100">
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                ))
              ) : allActivities.length > 0 ? (
                allActivities.map((act, index) => (
                  <div key={act.id} className={`pb-4 ${index !== allActivities.length - 1 ? 'border-b border-[#E5E7E1]' : ''}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-medium text-[#6B7C87]">
                        {new Date(act.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        act.type === 'SK' ? 'bg-[#EEF5FA] text-[#2A75B3]' : 'bg-[#F3E8FF] text-[#7E22CE]'
                      }`}>
                        ● {act.type}
                      </span>
                    </div>
                    <Link href={act.link} className="block text-sm font-semibold text-[#14232E] hover:text-[#12333D] transition-colors line-clamp-2">
                      {act.title}
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <ClockIcon className="w-6 h-6 text-[#A6C0CF] mb-2" />
                  <p className="text-sm font-medium text-[#6B7C87]">Belum ada aktivitas.</p>
                </div>
              )}
            </div>
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
