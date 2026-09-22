"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { publicAnnouncementService } from '../../lib/api/announcements';
import { Announcement } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';

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
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-[#E5E7E1] pb-6">
        <h1 className="text-3xl font-bold text-[#1F2937]">Pengumuman Surat Keputusan</h1>
        <p className="mt-2 text-lg text-[#4B5563]">
          Portal informasi daftar Surat Keputusan yang telah dipublikasikan secara resmi.
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-[#FFFFFF] p-4 sm:p-6 rounded-xl shadow-sm border border-[#E5E7E1] flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/2">
          <label htmlFor="search" className="block text-sm font-medium text-[#1F2937] mb-1">
            Pencarian
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#266210] focus:border-[#266210] text-sm"
            />
          </div>
        </div>

        <div className="w-full md:w-1/4">
          <label htmlFor="year" className="block text-sm font-medium text-[#1F2937] mb-1">
            Tahun
          </label>
          <select
            id="year"
            aria-label="Filter Tahun"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-[#266210] focus:border-[#266210] text-sm"
          >
            <option value="">Semua Tahun</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label htmlFor="sort" className="block text-sm font-medium text-[#1F2937] mb-1">
            Urutkan
          </label>
          <select
            id="sort"
            aria-label="Pengurutan"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-[#266210] focus:border-[#266210] text-sm"
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
          </select>
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
              {announcements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/announcements/${announcement.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-[#E5E7E1] p-6 hover:shadow-md hover:border-[#266210] transition-all group"
                >
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#4B5563]">
                          {new Date(announcement.sk_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#1F2937] group-hover:text-[#266210] transition-colors">
                        {announcement.sk_number}
                      </h3>
                      <p className="text-[#4B5563] text-sm line-clamp-2">
                        {announcement.description}
                      </p>
                    </div>
                    <div className="shrink-0 mt-2 sm:mt-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#EEF5EA] text-[#266210] border border-[#E0EED9]">
                        Published
                      </span>
                    </div>
                  </div>
                </Link>
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
                                  ? 'z-10 bg-[#266210] text-white focus-visible:outline-[#266210]'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#266210]"></div>
      </div>
    }>
      <AnnouncementsContent />
    </Suspense>
  );
}
