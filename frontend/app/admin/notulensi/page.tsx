"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { adminMeetingService, MeetingParams } from '../../../lib/api/meetings';
import { Meeting } from '../../../types';
import { confirmDelete as swalConfirmDelete, toastSuccess } from '../../../lib/swal';

export default function AdminMeetingsPage() {
  const [data, setData] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for search, filter, sort, pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [sort, setSort] = useState('tanggal terbaru');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    last_page: 1,
    from: 0,
    to: 0
  });

  // Available years based on data range
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
  const [counts, setCounts] = useState({ published: 0, draft: 0 });

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle filter changes that should reset page
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Fetch available years (oldest to newest)
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const oldestRes = await adminMeetingService.getAll({ sort: 'tanggal terlama', page: 1 });
        const newestRes = await adminMeetingService.getAll({ sort: 'tanggal terbaru', page: 1 });
        
        if (oldestRes.data?.data && oldestRes.data.data.length > 0 && newestRes.data?.data && newestRes.data.data.length > 0) {
          const oldestYear = new Date(oldestRes.data.data[0].meeting_date).getFullYear();
          let newestYear = new Date(newestRes.data.data[0].meeting_date).getFullYear();
          
          const currentYear = new Date().getFullYear();
          if (currentYear > newestYear) {
            newestYear = currentYear;
          }
          
          const years = [];
          for (let y = newestYear; y >= oldestYear; y--) {
            years.push(y.toString());
          }
          setAvailableYears(years);
        } else {
          setAvailableYears([new Date().getFullYear().toString()]);
        }
      } catch (err) {
        console.error("Failed to fetch year ranges:", err);
      }
    };
    fetchYears();
  }, []);

  // Main data fetch
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: MeetingParams = {
        page,
        sort,
        status: activeTab,
      };
      
      if (debouncedSearch) params.search = debouncedSearch;
      if (year) params.year = year;

      const response = await adminMeetingService.getAll(params);
      setData(response.data?.data || []);
      if (response.counts) {
        setCounts(response.counts);
      }
      setPagination({
        total: response.data?.total || 0,
        per_page: response.data?.per_page || 10,
        last_page: response.data?.last_page || 1,
        from: response.data?.from || 0,
        to: response.data?.to || 0,
      });
    } catch (err) {
      setError("Gagal memuat data Rapat.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, year, sort, page, activeTab]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Actions
  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      setActionLoadingId(id);
      const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
      await adminMeetingService.updateStatus(id, newStatus);
      // Refetch so item disappears from current tab
      fetchData();
    } catch (err) {
      alert('Gagal memperbarui status.');
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // When tab changes, reset page
  const handleTabChange = (tab: 'published' | 'draft') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    const result = await swalConfirmDelete('Rapat ini');
    if (!result.isConfirmed) return;
    try {
      setActionLoadingId(id);
      await adminMeetingService.delete(id);
      toastSuccess('Rapat berhasil dihapus.');
      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Rapat</h1>
          <p className="text-sm text-[#4B5563] mt-1">Kelola seluruh Rapat pada sistem ini.</p>
        </div>
        <Link 
          href="/admin/notulensi/create" 
          className="inline-flex items-center gap-2 bg-[#E5A822] hover:bg-[#C28B15] text-[#FFFFFF] px-5 py-2.5 rounded-lg font-semibold transition-colors shrink-0 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Rapat
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F7F8F5] rounded-xl border border-[#E5E7E1] w-fit">
        <button
          onClick={() => handleTabChange('published')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'published'
              ? 'bg-white text-[#096F9A] shadow-sm border border-[#E5E7E1]'
              : 'text-[#6B7C87] hover:text-[#1F2937]'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Rapat Publish
            <span className={`px-1.5 py-0.5 rounded-md text-xs ml-1 ${
              activeTab === 'published' ? 'bg-[#096F9A]/10 text-[#096F9A]' : 'bg-gray-200 text-gray-600'
            }`}>
              {counts.published}
            </span>
          </span>
        </button>
        <button
          onClick={() => handleTabChange('draft')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'draft'
              ? 'bg-white text-rose-600 shadow-sm border border-[#E5E7E1]'
              : 'text-[#6B7C87] hover:text-[#1F2937]'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            Rapat Rahasia
            <span className={`px-1.5 py-0.5 rounded-md text-xs ml-1 ${
              activeTab === 'draft' ? 'bg-rose-100 text-rose-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {counts.draft}
            </span>
          </span>
        </button>
      </div>

      {/* Toolbar: Search, Filter, Sort */}
      <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-2xl border border-[#E5E7E1] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[#98A2B3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-[#E5E7E1] rounded-lg focus:ring-[#096F9A] focus:border-[#096F9A] text-[#1F2937] text-sm bg-white"
            placeholder="Cari No. Surat atau tentang... atau tentang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2">
            <label htmlFor="year-filter" className="text-sm font-medium text-[#4B5563] whitespace-nowrap">Tahun:</label>
            <select
              id="year-filter"
              className="border border-[#E5E7E1] rounded-lg text-sm px-3 py-2.5 focus:ring-[#096F9A] focus:border-[#096F9A] text-[#1F2937] bg-white min-w-[120px]"
              value={year}
              onChange={handleYearChange}
            >
              <option value="">Semua Tahun</option>
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="sort-filter" className="text-sm font-medium text-[#4B5563] whitespace-nowrap">Urutkan:</label>
            <select
              id="sort-filter"
              className="border border-[#E5E7E1] rounded-lg text-sm px-3 py-2.5 focus:ring-[#096F9A] focus:border-[#096F9A] text-[#1F2937] bg-white min-w-[150px]"
              value={sort}
              onChange={handleSortChange}
            >
              <option value="tanggal terbaru">Terbaru</option>
              <option value="tanggal terlama">Terlama</option>
              <option value="nomor Rapat">Nomor Rapat</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#E5E7E1] shadow-sm text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-[#1F2937]">{error}</h3>
          <button 
            onClick={fetchData} 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#E5A822] hover:bg-[#C28B15]"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7E1] shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm text-[#4B5563]">
              <thead className="bg-[#F7F8F5] text-xs uppercase text-[#98A2B3] border-b border-[#E5E7E1]">
                <tr>
                  <th className="px-6 py-4 font-medium w-16">No</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">No. Surat Undangan</th>
                  <th className="px-6 py-4 font-medium whitespace-nowrap">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Tentang</th>
                  <th className="px-6 py-4 font-medium text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-medium text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7E1]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-32 mx-auto"></div></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[#98A2B3]">
                      <svg className="mx-auto h-12 w-12 text-[#E5E7E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 text-base">
                        {debouncedSearch || year 
                          ? 'Rapat tidak ditemukan' 
                          : activeTab === 'published' ? 'Belum ada Rapat yang dipublish' : 'Belum ada Rapat Rahasia'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.map((Rapat, index) => {
                    const rowIndex = pagination.from + index;
                    const isDeleting = actionLoadingId === Rapat.id;
                    const isToggling = actionLoadingId === Rapat.id;
                    
                    return (
                      <tr key={Rapat.id} className="hover:bg-[#F7F8F5] transition-colors">
                        <td className="px-6 py-4 font-medium">{rowIndex}</td>
                        <td className="px-6 py-4 font-medium text-[#1F2937] whitespace-nowrap">{Rapat.invitation_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(Rapat.meeting_date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 min-w-[250px] whitespace-pre-wrap">
                          {Rapat.description}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            Rapat.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              Rapat.status === 'published' ? 'bg-emerald-500' : 'bg-rose-400'
                            }`} />
                            {Rapat.status === 'published' ? 'Published' : 'Rahasia'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Link 
                              href={`/admin/notulensi/${Rapat.id}`}
                              className="p-1.5 text-[#4B5563] hover:text-[#096F9A] hover:bg-[#F0F8FB] rounded transition-colors"
                              aria-label="Detail Rapat"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </Link>
                            <Link 
                              href={`/admin/notulensi/${Rapat.id}/edit`}
                              className="p-1.5 text-[#4B5563] hover:text-[#FFD51E] hover:bg-[#FFF8CC] rounded transition-colors"
                              aria-label="Edit Rapat"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.113l-2.842.835a.375.375 0 01-.456-.456l.835-2.842a4.5 4.5 0 011.113-1.89l12.442-12.442z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(Rapat.id)}
                              disabled={isDeleting}
                              className={`p-1.5 text-[#4B5563] hover:text-red-600 hover:bg-red-50 rounded transition-colors ${isDeleting ? 'opacity-50 cursor-wait' : ''}`}
                              aria-label="Hapus Rapat"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!isLoading && data.length > 0 && pagination.last_page > 1 && (
            <div className="px-6 py-4 border-t border-[#E5E7E1] bg-[#FFFFFF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-[#4B5563]">
                Menampilkan <span className="font-medium text-[#1F2937]">{pagination.from}</span> dari <span className="font-medium text-[#1F2937]">{pagination.to}</span> Rapat (Total {pagination.total})
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-[#E5E7E1] rounded-lg text-sm font-medium text-[#4B5563] bg-white hover:bg-[#F7F8F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>
                <div className="text-sm font-medium text-[#1F2937] px-2">
                  Halaman {page} dari {pagination.last_page}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                  disabled={page === pagination.last_page}
                  className="px-3 py-1.5 border border-[#E5E7E1] rounded-lg text-sm font-medium text-[#4B5563] bg-white hover:bg-[#F7F8F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
