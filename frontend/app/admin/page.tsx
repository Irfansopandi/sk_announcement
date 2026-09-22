"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { adminAnnouncementService } from '../../lib/api/announcements';
import { Announcement } from '../../types';

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [recentSKs, setRecentSKs] = useState<Announcement[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch All (Recent + Total Count)
        // We use sort="tanggal terbaru" which is the default in backend, or explicit
        const allRes = await adminAnnouncementService.getAll({ sort: 'tanggal terbaru', page: 1 });
        
        // 2. Fetch Published Total
        const pubRes = await adminAnnouncementService.getAll({ status: 'published', page: 1 });
        
        // 3. Fetch Draft Total
        const draftRes = await adminAnnouncementService.getAll({ status: 'draft', page: 1 });
        
        setRecentSKs(allRes.data?.data.slice(0, 5) || []); 
        setStats({
          total: allRes.data?.total || 0,
          published: pubRes.data?.total || 0,
          draft: draftRes.data?.total || 0,
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
      <div className="bg-gradient-to-r from-[#266210] to-[#1E4F0D] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Selamat datang kembali, {user?.name}</h2>
          <p className="text-[#EEF5EA] text-sm sm:text-base max-w-xl">
            Kelola dan pantau pengumuman Surat Keputusan dengan lebih mudah dan cepat melalui panel admin ini.
          </p>
        </div>
        <Link 
          href="/admin/announcements/create" 
          className="inline-flex items-center gap-2 bg-[#FFD51E] hover:bg-[#DDB800] text-[#1F2937] px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah SK
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7E1] shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#EEF5EA] text-[#266210] rounded-xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1">Total SK</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div> : stats.total}
            </h3>
            <p className="text-xs text-[#98A2B3] mt-1">Semua SK terdaftar</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7E1] shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#EEF5EA] text-[#266210] rounded-xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1">Published</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div> : stats.published}
            </h3>
            <p className="text-xs text-[#98A2B3] mt-1">Tampil di portal Guest</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7E1] shadow-sm flex items-start gap-4">
          <div className="p-3 bg-[#FFF8CC] text-[#DDB800] rounded-xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[#4B5563] mb-1">Draft</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">
              {isLoading ? <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div> : stats.draft}
            </h3>
            <p className="text-xs text-[#98A2B3] mt-1">Belum dipublikasikan</p>
          </div>
        </div>

      </div>

      {/* Recent SK */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7E1] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E7E1] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#1F2937]">Surat Keputusan Terbaru</h3>
          <Link href="/admin/announcements" className="text-sm font-medium text-[#266210] hover:text-[#1E4F0D]">
            Lihat Semua &rarr;
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4B5563]">
            <thead className="bg-[#F7F8F5] text-xs uppercase text-[#98A2B3]">
              <tr>
                <th className="px-6 py-4 font-medium">No. SK</th>
                <th className="px-6 py-4 font-medium">Tanggal</th>
                <th className="px-6 py-4 font-medium">Keterangan</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7E1]">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : recentSKs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#98A2B3]">
                    Belum ada Surat Keputusan terdaftar
                  </td>
                </tr>
              ) : (
                recentSKs.map((sk) => (
                  <tr key={sk.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1F2937] whitespace-nowrap">{sk.sk_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(sk.sk_date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={sk.description}>
                      {sk.description}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {sk.status === 'published' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#EEF5EA] text-[#266210] border border-[#266210]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#266210] mr-1.5"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7E1]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#98A2B3] mr-1.5"></span>
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
