"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicAnnouncementService } from '../../../../lib/api/announcements';
import { Announcement } from '../../../../types';

export default function SKDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await publicAnnouncementService.getById(Number(unwrappedParams.id));
        if (response.success && response.data) {
          setAnnouncement(response.data);
        } else {
          setError('Gagal memuat detail Surat Keputusan.');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Memuat data Surat Keputusan...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
          <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold text-red-800 mb-2">Data Tidak Ditemukan</h3>
          <p className="text-red-600 text-sm mb-6">{error || 'Surat Keputusan yang Anda cari mungkin telah dihapus atau tidak tersedia.'}</p>
          <button
            onClick={() => router.push('/pengumuman')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
          >
            Kembali ke Daftar SK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Navigation */}
      <Link 
        href="/pengumuman" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors group"
      >
        <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        Kembali ke Daftar
      </Link>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7E1] overflow-hidden">
        {/* Header Info */}
        <div className="bg-emerald-50/50 border-b border-emerald-100 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/50 w-fit">
              Surat Keputusan
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(announcement.sk_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#14232E] leading-tight">
            {announcement.sk_number}
          </h1>
        </div>

        {/* Description Body */}
        <div className="p-5 md:p-6 bg-white">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
             <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
             </svg>
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
               Keterangan & Isi Ringkas
             </h3>
          </div>
          <div className="bg-slate-50 border border-slate-100/60 rounded-xl p-4 md:p-5 text-slate-700 text-base leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {announcement.description}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-100 p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-900 font-bold truncate">
                {announcement.documents && announcement.documents.length > 0 
                  ? announcement.documents[0].file_name 
                  : 'Dokumen SK Belum Diunggah'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {announcement.documents && announcement.documents.length > 0 
                  ? `${(announcement.documents[0].file_size / 1024).toFixed(0)} KB • ${announcement.documents[0].file_type.includes('pdf') ? 'PDF' : 'Excel/Doc'}` 
                  : 'Menunggu admin mengunggah file lampiran.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (announcement.documents && announcement.documents.length > 0) {
                const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
                window.open(`${baseUrl}/api/documents/${announcement.documents[0].id}/download`, '_blank');
              }
            }}
            disabled={!announcement.documents || announcement.documents.length === 0}
            className="inline-flex shrink-0 items-center justify-center w-full sm:w-auto gap-2 px-6 py-2.5 text-sm font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download File SK
          </button>
        </div>
      </div>
    </div>
  );
}
