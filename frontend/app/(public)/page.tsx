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
import { publicMeetingService } from '../../lib/api/meetings';
import { Announcement, Meeting } from '../../types';

export default function DashboardPage() {
  const [allSKsForYear, setAllSKsForYear] = useState<Announcement[]>([]);
  const [allNotulensiForYear, setAllNotulensiForYear] = useState<Meeting[]>([]);
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);
  const [yearSK, setYearSK] = useState<number>(0);
  
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [greeting, setGreeting] = useState('Selamat Datang');
  const [heroSlide, setHeroSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const heroSlidesData = [
    {
      image: "/hero1.webp",
      title: <>Informasi Surat Keputusan<br />dan Rapat</>,
      description: "Akses informasi terbaru mengenai Surat Keputusan (SK) dan hasil rapat secara transparan dan mudah."
    },
    {
      image: "/hero2.webp",
      title: <>Tingkatkan Efisiensi<br />dan Kolaborasi Tim</>,
      description: "Pantau keputusan penting dan pastikan semua anggota tim selalu terhubung dengan informasi terkini."
    },
    {
      image: "/hero3.webp",
      title: <>Transparansi Data<br />Untuk Kemajuan Bersama</>,
      description: "Sistem yang dirancang untuk memberikan kemudahan akses data korporat secara real-time dan akurat."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setHeroSlide((prev) => prev + 1);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (heroSlide === heroSlidesData.length) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setHeroSlide(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [heroSlide]);

  const handleDotClick = (idx: number) => {
    setIsTransitioning(true);
    setHeroSlide(idx);
  };

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

        // Fetch real Notulensi data based on calendar year
        const yearMeetingRes = await publicMeetingService.getAll({ year: currentDate.getFullYear().toString(), per_page: 1000 });
        if (yearMeetingRes.success && yearMeetingRes.data) {
          setAllNotulensiForYear(yearMeetingRes.data.data);
        } else {
          setAllNotulensiForYear([]);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate.getFullYear()]); // Refetch if calendar year changes

  // Filter logic based on calendar selection
  const getFilteredSKs = () => {
    if (selectedFilterDate) {
      // Exact date match (Show ALL for this date, no slice)
      return allSKsForYear.filter(sk => {
        const skDateOnly = sk.sk_date.split('T')[0].split(' ')[0];
        return skDateOnly === selectedFilterDate;
      }).sort((a,b) => new Date(b.sk_date).getTime() - new Date(a.sk_date).getTime());
    } else {
      // Default: Show 10 absolute latest SKs
      return [...allSKsForYear]
        .sort((a,b) => new Date(b.sk_date).getTime() - new Date(a.sk_date).getTime())
        .slice(0, 10);
    }
  };

  const getFilteredNotulensi = () => {
    if (selectedFilterDate) {
      return allNotulensiForYear.filter(n => {
        const dateOnly = n.meeting_date.split('T')[0].split(' ')[0];
        return dateOnly === selectedFilterDate;
      }).sort((a,b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime());
    } else {
      // Default: Show 10 absolute latest Rapat
      return [...allNotulensiForYear]
        .sort((a,b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime())
        .slice(0, 10);
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
    const dayNotulensi = allNotulensiForYear.filter(n => {
      const dateOnly = n.meeting_date.split('T')[0].split(' ')[0];
      return dateOnly === dateStr;
    });
    
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
      link: `/pengumuman?search=${encodeURIComponent(sk.sk_number)}`
    })),
    ...latestNotulensi.map(n => ({
      id: `notulensi-${n.id}`,
      type: 'Rapat',
      title: n.description,
      date: n.meeting_date,
      link: `/notulensi?search=${encodeURIComponent(n.invitation_number)}`
    }))
  ];

  const allActivities = [...historyItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-black text-white shadow-lg h-64 md:h-80 lg:h-96">
        
        {/* Slides */}
        {[...heroSlidesData, heroSlidesData[0]].map((slide, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 w-full h-full flex items-center ${isTransitioning ? 'transition-transform duration-1000 ease-in-out' : ''}`}
            style={{ transform: `translateX(${(idx - heroSlide) * -100}%)` }}
          >
            {/* Image */}
            <img 
              src={slide.image} 
              alt={`Hero Background ${idx + 1}`} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F2A]/90 via-[#0B1F2A]/70 to-transparent pointer-events-none" />
            
            {/* Text Content */}
            <div className="relative z-10 p-8 md:p-12 lg:w-2/3 h-full flex flex-col justify-center">
              <div className="mb-2">
                <p className="text-sm md:text-base font-bold text-[#D4AF37] tracking-wider uppercase drop-shadow-md">{greeting}</p>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-[#CFDFE8] text-base md:text-lg max-w-xl leading-relaxed drop-shadow-md">
                {slide.description}
              </p>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
           {heroSlidesData.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => handleDotClick(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${(heroSlide % heroSlidesData.length) === idx ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
           ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SK Card */}
        <Link href={`/pengumuman?year=${currentDate.getFullYear()}`} className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-emerald-50/60 border border-emerald-200 hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50 cursor-pointer block">
          <div className="flex w-full items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <FileTextIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-1">Total SK Per Tahun</p>
              {loading ? (
                <div className="h-8 w-16 bg-emerald-200/50 rounded animate-pulse" />
              ) : (
                <h3 className="text-3xl font-bold text-slate-800">{yearSK}</h3>
              )}
              <p className="text-xs text-slate-500 mt-1">Total SK tahun {currentDate.getFullYear()}</p>
            </div>
            <div className="text-emerald-300 group-hover:text-emerald-600 transition-colors self-center p-2">
              <ChevronRightIcon className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Notulensi Card */}
        <Link href={`/notulensi?year=${currentDate.getFullYear()}`} className="group rounded-2xl p-6 shadow-sm flex items-start gap-4 transition-all duration-300 bg-amber-50/60 border border-amber-200 hover:border-amber-500 hover:shadow-md hover:bg-amber-50 cursor-pointer block">
          <div className="flex w-full items-start gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              <FileTextIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Rapat Per Tahun</p>
              <h3 className="text-3xl font-bold text-slate-800">{allNotulensiForYear.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Total rapat tahun {currentDate.getFullYear()}</p>
            </div>
            <div className="text-amber-300 group-hover:text-amber-600 transition-colors self-center p-2">
              <ChevronRightIcon className="w-5 h-5" />
            </div>
          </div>
        </Link>
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
            <Link href="/pengumuman" className="text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1">
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
                <Link key={sk.id} href={`/pengumuman?search=${encodeURIComponent(sk.sk_number)}`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors border border-transparent hover:border-[#E5E7E1]">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <FileTextIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-[#6B7C87]">
                        {new Date(sk.sk_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs font-semibold text-[#14232E] truncate">{sk.sk_number}</span>
                    </div>
                    <p className="text-sm text-[#14232E] font-medium line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                      {sk.description}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#A6C0CF] group-hover:text-emerald-600 shrink-0 self-center transition-colors" />
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

        {/* Middle Col: Rapat */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7E1] flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#12333D]" />
              <h2 className="text-lg font-bold text-[#14232E]">Rapat</h2>
            </div>
            <Link href="/notulensi" className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors flex items-center gap-1">
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
                <Link key={item.id} href={`/notulensi?search=${encodeURIComponent(item.invitation_number)}`} className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#F5F7F8] transition-colors border border-transparent hover:border-[#E5E7E1]">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                     <span className="block text-xs font-medium text-[#6B7C87] mb-1">
                        {new Date(item.meeting_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    <h3 className="text-sm text-[#14232E] font-medium line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {item.invitation_number}
                    </h3>
                    <p className="text-xs text-[#6B7C87] mt-1 line-clamp-1">{item.description}</p>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-[#A6C0CF] group-hover:text-amber-600 shrink-0 self-center transition-colors" />
                </Link>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F5F7F8] rounded-xl border border-dashed border-[#CFDFE8]">
                <CalendarIcon className="w-8 h-8 text-[#A6C0CF] mb-2" />
                <p className="text-sm font-medium text-[#6B7C87]">Belum ada data rapat yang tersedia.</p>
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
                        ? 'bg-emerald-600 text-white font-bold shadow-md scale-110' 
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
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${selectedFilterDate === dateStr ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'}`} title={`${skCount} Surat Keputusan`}>
                            {skCount}
                          </div>
                        )}
                        {notulensiCount > 0 && (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm ${selectedFilterDate === dateStr ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'}`} title={`${notulensiCount} Rapat`}>
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
                        act.type === 'SK' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
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
