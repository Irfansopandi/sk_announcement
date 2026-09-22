"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AnnouncementForm from '../../../../../components/admin/AnnouncementForm';
import { adminAnnouncementService } from '../../../../../lib/api/announcements';
import { ApiError } from '../../../../../lib/api/client';
import { Announcement } from '../../../../../types';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || isNaN(id)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotFound(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const response = await adminAnnouncementService.getById(id);
        if (response.data) {
          setInitialData(response.data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true);
        } else if (error instanceof ApiError && error.status === 401) {
          setGlobalError("Anda perlu login kembali.");
        } else if (error instanceof ApiError && error.status === 403) {
          setGlobalError("Anda tidak memiliki akses.");
        } else {
          setGlobalError("Gagal terhubung ke server.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleSubmit = async (data: {
    sk_number: string;
    sk_date: string;
    description: string;
    status: 'draft' | 'published';
  }) => {
    try {
      setIsSubmitting(true);
      setErrors({});
      setGlobalError(null);

      await adminAnnouncementService.update(id, data);
      
      // Success
      alert("Surat Keputusan berhasil diperbarui.");
      router.push('/admin/announcements');
      
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 422 && error.data && typeof error.data === 'object') {
          const errData = error.data as { message?: string; errors?: Record<string, string[]> };
          if (errData.errors) {
            setErrors(errData.errors);
            setGlobalError("Terdapat data yang belum sesuai.");
          } else {
            setGlobalError(errData.message || "Terdapat data yang belum sesuai.");
          }
        } else if (error.status === 401) {
          setGlobalError("Anda perlu login kembali.");
        } else if (error.status === 403) {
          setGlobalError("Anda tidak memiliki akses.");
        } else if (error.status === 404) {
          setGlobalError("Surat Keputusan tidak ditemukan.");
        } else if (error.status === 500) {
          setGlobalError("Terjadi kesalahan pada server.");
        } else {
          setGlobalError("Terjadi kesalahan yang tidak diketahui.");
        }
      } else {
        setGlobalError("Gagal terhubung ke server.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7E1] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-10 w-1/2 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-32 w-full bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto bg-[#FFFFFF] p-12 rounded-2xl border border-[#E5E7E1] shadow-sm text-center">
        <svg className="mx-auto h-16 w-16 text-[#98A2B3] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31 8.966 8.966 0 01-2.3-1.259M9.143 17.082c.281.017.57.033.867.049m3.434-.049a24.26 24.26 0 003.844-.148m-3.844.148a20.088 20.088 0 003.434-.049m-3.434.049a23.856 23.856 0 005.455-1.31 8.966 8.966 0 002.3-1.259" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
        </svg>
        <h2 className="text-xl font-bold text-[#1F2937] mb-2">Surat Keputusan tidak ditemukan.</h2>
        <p className="text-[#4B5563] mb-6">Data yang Anda cari tidak ada atau mungkin sudah dihapus.</p>
        <Link 
          href="/admin/announcements"
          className="inline-flex items-center px-6 py-2.5 bg-[#266210] hover:bg-[#1E4F0D] text-white rounded-lg font-medium transition-colors"
        >
          Kembali ke Daftar SK
        </Link>
      </div>
    );
  }

  return (
    <div>
      {globalError && (
        <div className="mb-6 max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3">
          <svg className="h-5 w-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium">{globalError}</p>
        </div>
      )}
      
      {initialData && (
        <AnnouncementForm
          title="Edit Surat Keputusan"
          submitText="Perbarui Data"
          initialData={{
            sk_number: initialData.sk_number,
            // Format YYYY-MM-DD for date input
            sk_date: initialData.sk_date.split('T')[0],
            description: initialData.description,
            status: initialData.status
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
        />
      )}
    </div>
  );
}
