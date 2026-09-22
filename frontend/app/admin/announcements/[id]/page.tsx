"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminAnnouncementService } from '../../../../lib/api/announcements';
import { Announcement } from '../../../../types';
import { ApiError } from '../../../../lib/api/client';
import DocumentManager from '../../../../components/admin/DocumentManager';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  
  const [data, setData] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await adminAnnouncementService.getById(id);
        setData(res.data || null);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError("Surat Keputusan tidak ditemukan.");
          } else if (err.status === 401) {
            setError("Sesi telah habis. Silakan login kembali.");
          } else if (err.status === 403) {
            setError("Anda tidak memiliki akses ke halaman ini.");
          } else {
            setError("Gagal memuat detail Surat Keputusan.");
          }
        } else {
          setError("Gagal terhubung ke server.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#266210] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#E5E7E1] shadow-sm text-center">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-[#1F2937]">{error || "Data tidak ditemukan"}</h3>
        <Link 
          href="/admin/announcements" 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#266210] bg-[#EEF5EA] hover:bg-[#E0EED9]"
        >
          Kembali ke Daftar SK
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/announcements"
            className="p-2 shrink-0 border border-[#E5E7E1] rounded-lg text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F7F8F5] transition-colors"
            aria-label="Kembali"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Detail SK</h1>
            <p className="text-sm text-[#4B5563] mt-1">Informasi lengkap Surat Keputusan dan dokumen terkait.</p>
          </div>
        </div>
        
        <Link 
          href={`/admin/announcements/${data.id}/edit`} 
          className="inline-flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#F7F8F5] border border-[#E5E7E1] text-[#1F2937] px-5 py-2.5 rounded-lg font-medium transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.113l-2.842.835a.375.375 0 01-.456-.456l.835-2.842a4.5 4.5 0 011.113-1.89l12.442-12.442z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
          </svg>
          Edit SK
        </Link>
      </div>

      {/* SK Info Card */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E7E1] shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-6 border-b border-[#E5E7E1] pb-4">Informasi Surat Keputusan</h2>
        
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-[#4B5563]">Nomor SK</dt>
            <dd className="mt-1 text-base font-semibold text-[#1F2937]">{data.sk_number}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-[#4B5563]">Tanggal SK</dt>
            <dd className="mt-1 text-base text-[#1F2937]">
              {new Date(data.sk_date).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-[#4B5563]">Status</dt>
            <dd className="mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                data.status === 'published' 
                  ? 'bg-[#EEF5EA] text-[#266210] border-[#266210]/20' 
                  : 'bg-[#FFF8CC] text-[#DDB800] border-[#DDB800]/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${data.status === 'published' ? 'bg-[#266210]' : 'bg-[#DDB800]'}`}></span>
                {data.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-[#4B5563]">Keterangan</dt>
            <dd className="mt-1 text-base text-[#1F2937] whitespace-pre-wrap">{data.description}</dd>
          </div>
        </dl>
      </div>

      {/* Document Manager Section */}
      <DocumentManager announcementId={data.id} />
      
    </div>
  );
}
