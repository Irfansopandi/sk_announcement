"use client";

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { publicAnnouncementService } from '../../../lib/api/announcements';
import { Announcement } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce';

// Custom Dropdown Component
function CustomDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === String(value)) || options[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="flex w-full items-center justify-between py-2.5 px-3 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white hover:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                  String(value) === String(option.value) ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-700'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AnnouncementsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State initialization from URL or defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'terbaru');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await publicAnnouncementService.getAll({
        search: debouncedSearch,
        year: year || undefined,
        sort,
        page,
      });

      if (response.success && response.data) {
        setAnnouncements(response.data.data);
        setTotalPages(response.data.last_page);
        setTotalItems(response.data.total);
      } else {
        setError('Gagal memuat pengumuman.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, year, sort, page]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (year) params.set('year', year);
    if (sort && sort !== 'terbaru') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, year, sort, page, router, pathname]);

  // Fetch data when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Reset pagination when filters change (except page itself)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, year, sort]);

  const handleReset = () => {
    setSearchTerm('');
    setYear('');
    setSort('terbaru');
    setPage(1);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-[#E5E7E1] pb-6">
        <h1 className="text-3xl font-bold text-[#14232E]">Surat Keputusan</h1>
        <p className="mt-2 text-lg text-[#6B7C87]">
          Portal informasi daftar Surat Keputusan yang telah dipublikasikan secara resmi.
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-[#FFFFFF] p-4 sm:p-6 rounded-xl shadow-sm border border-[#E5E7E1] flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label htmlFor="search" className="block text-sm font-semibold text-[#14232E] mb-2">
            Pencarian
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              aria-label="Cari No. SK atau Keterangan"
              placeholder="Cari No. SK atau Keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 placeholder-slate-400 bg-white transition-colors"
            />
          </div>
        </div>

        <div className="w-full md:w-1/4">
          <label htmlFor="year" className="block text-sm font-semibold text-[#14232E] mb-2">
            Tahun
          </label>
          <CustomDropdown 
            value={year}
            options={[
              { label: 'Semua Tahun', value: '' },
              ...yearOptions.map(y => ({ label: String(y), value: String(y) }))
            ]}
            onChange={(val) => setYear(val)}
          />
        </div>

        <div className="w-full md:w-1/4">
          <label htmlFor="sort" className="block text-sm font-semibold text-[#14232E] mb-2">
            Urutkan
          </label>
          <CustomDropdown 
            value={sort}
            options={[
              { label: 'Terbaru', value: 'terbaru' },
              { label: 'Terlama', value: 'terlama' },
            ]}
            onChange={(val) => setSort(val)}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="min-h-[400px]">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-red-800">Pengumuman tidak dapat dimuat.</h3>
            <div className="mt-6">
              <button
                onClick={fetchAnnouncements}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-[#E5E7E1] p-6 animate-pulse flex flex-col sm:flex-row gap-4 justify-between">
                <div className="space-y-3 w-full sm:w-2/3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded shrink-0"></div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white border border-[#E5E7E1] rounded-xl p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {debouncedSearch || year ? 'Surat Keputusan tidak ditemukan' : 'Belum ada Surat Keputusan'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {debouncedSearch || year 
                ? 'Coba sesuaikan kata kunci pencarian atau filter tahun.' 
                : 'Sistem belum memiliki Surat Keputusan yang dipublikasikan.'}
            </p>
            {(debouncedSearch || year) && (
              <div className="mt-6">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[#4B5563]">Menampilkan {totalItems} Surat Keputusan</p>
            <div className="grid gap-4">
              {/* Table Header (visible on lg screens) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-emerald-50 rounded-lg border border-emerald-100 text-sm font-semibold text-emerald-800">
                <div className="col-span-2">Tanggal SK</div>
                <div className="col-span-3">Nomor SK</div>
                <div className="col-span-4">Tentang</div>
                <div className="col-span-3 text-right">Aksi</div>
              </div>

              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-xl shadow-sm border border-[#E5E7E1] p-5 lg:p-0 hover:shadow-md hover:border-emerald-300 transition-all group"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-center lg:px-6 lg:py-5">
                    {/* Date */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      <span className="lg:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tanggal SK</span>
                      <span className="text-sm font-medium text-slate-600">
                        {new Date(announcement.sk_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Nomor SK */}
                    <div className="lg:col-span-3 flex flex-col justify-center">
                      <span className="lg:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nomor SK</span>
                      <h3 className="text-base font-bold text-[#14232E] group-hover:text-emerald-600 transition-colors">
                        {announcement.sk_number}
                      </h3>
                      <span className="inline-flex mt-1 lg:hidden w-fit items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        Published
                      </span>
                    </div>

                    {/* Deskripsi */}
                    <div className="lg:col-span-4 flex flex-col justify-center">
                      <span className="lg:hidden text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tentang</span>
                      <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {announcement.description}
                      </p>
                    </div>

                    {/* Aksi */}
                    <div className="lg:col-span-3 flex items-center justify-start lg:justify-end gap-2 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">

                      <button
                        onClick={() => {
                          if (announcement.documents && announcement.documents.length > 0) {
                            const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
                            window.open(`${baseUrl}/api/documents/${announcement.documents[0].id}/download`, '_blank');
                          }
                        }}
                        disabled={!announcement.documents || announcement.documents.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Halaman <span className="font-medium">{page}</span> dari <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Sebelumnya</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page Numbers */}
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        // Simple pagination display logic (show first, last, and current surroundings)
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              aria-current={page === pageNum ? 'page' : undefined}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                page === pageNum
                                  ? 'z-10 bg-emerald-600 text-white focus-visible:outline-emerald-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === page - 2 || 
                          pageNum === page + 2
                        ) {
                          return (
                            <span key={pageNum} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Berikutnya</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense because we are using useSearchParams()
export default function PublicAnnouncementsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <AnnouncementsContent />
    </Suspense>
  );
}
