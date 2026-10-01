"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminMeetingService } from '../../../../lib/api/meetings';
import { Meeting } from '../../../../types';
import { ApiError } from '../../../../lib/api/client';

export default function MeetingDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  
  const [data, setData] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await adminMeetingService.getById(id);
        setData(res.data || null);
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError("Rapat tidak ditemukan.");
          } else if (err.status === 401) {
            setError("Sesi telah habis. Silakan login kembali.");
          } else if (err.status === 403) {
            setError("Anda tidak memiliki akses ke halaman ini.");
          } else {
            setError("Gagal memuat detail Rapat.");
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
          href="/admin/notulensi" 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#266210] bg-[#EEF5EA] hover:bg-[#E0EED9]"
        >
          Kembali ke Daftar Rapat
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
            href="/admin/notulensi"
            className="p-2 shrink-0 border border-[#E5E7E1] rounded-lg text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F7F8F5] transition-colors"
            aria-label="Kembali"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Detail Rapat</h1>
            <p className="text-sm text-[#4B5563] mt-1">Informasi lengkap Rapat dan dokumen terkait.</p>
          </div>
        </div>
        
        <Link 
          href={`/admin/notulensi/${data.id}/edit`} 
          className="inline-flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#F7F8F5] border border-[#E5E7E1] text-[#1F2937] px-5 py-2.5 rounded-lg font-medium transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.113l-2.842.835a.375.375 0 01-.456-.456l.835-2.842a4.5 4.5 0 011.113-1.89l12.442-12.442z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" />
          </svg>
          Edit Rapat
        </Link>
      </div>

      {/* Rapat Info Card */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E7E1] shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-6 border-b border-[#E5E7E1] pb-4">Informasi Rapat</h2>
        
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-[#4B5563]">Nomor Rapat</dt>
            <dd className="mt-1 text-base font-semibold text-[#1F2937]">{data.invitation_number}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-[#4B5563]">Tanggal Rapat</dt>
            <dd className="mt-1 text-base text-[#1F2937]">
              {new Date(data.meeting_date).toLocaleDateString('id-ID', {
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
                  : 'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${data.status === 'published' ? 'bg-[#266210]' : 'bg-rose-500'}`}></span>
                {data.status === 'published' ? 'Published' : 'Rahasia'}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-[#4B5563]">Keterangan</dt>
            <dd className="mt-1 text-base text-[#1F2937] whitespace-pre-wrap">{data.description}</dd>
          </div>
        </dl>
      </div>

      {/* Document Section */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E7E1] shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-6 border-b border-[#E5E7E1] pb-4">Dokumen Lampiran</h2>
        
        {data.document_name ? (
          <div className="flex items-center justify-between p-4 border border-[#E5E7E1] rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-[#096F9A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{data.document_name}</p>
                <p className="text-xs text-[#6B7C87]">Terlampir</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[#6B7C87] text-sm italic">Tidak ada dokumen lampiran.</p>
        )}
      </div>
      
    </div>
  );
}
