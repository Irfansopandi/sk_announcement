"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MeetingForm from '../../../../../components/admin/MeetingForm';
import { adminMeetingService } from '../../../../../lib/api/meetings';
import { ApiError } from '../../../../../lib/api/client';
import { Meeting } from '../../../../../types';
import { toastSuccess } from '../../../../../lib/swal';

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<Meeting | null>(null);
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
        const response = await adminMeetingService.getById(id);
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
    invitation_number: string;
    meeting_date: string;
    description: string;
    status: 'draft' | 'published';
    document?: File | null;
  }) => {
    try {
      setIsSubmitting(true);
      setErrors({});
      setGlobalError(null);

      const formData = new FormData();
      formData.append('invitation_number', data.invitation_number);
      formData.append('meeting_date', data.meeting_date);
      formData.append('description', data.description);
      formData.append('status', data.status);
      if (data.document) {
        formData.append('document', data.document);
      }

      await adminMeetingService.update(id, formData);
      
      // Success
      toastSuccess('Rapat berhasil diperbarui.');
      router.push('/admin/notulensi');
      
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
          setGlobalError("Rapat tidak ditemukan.");
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
        <h2 className="text-xl font-bold text-[#1F2937] mb-2">Rapat tidak ditemukan.</h2>
        <p className="text-[#4B5563] mb-6">Data yang Anda cari tidak ada atau mungkin sudah dihapus.</p>
        <Link 
          href="/admin/notulensi"
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
        <MeetingForm
          title="Edit Rapat"
          submitText="Perbarui Data"
          initialData={{
            invitation_number: initialData.invitation_number,
            // Format YYYY-MM-DD for date input
            meeting_date: initialData.meeting_date.split('T')[0],
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
