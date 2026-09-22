"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnnouncementForm from '../../../../components/admin/AnnouncementForm';
import { adminAnnouncementService } from '../../../../lib/api/announcements';
import { ApiError } from '../../../../lib/api/client';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

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

      await adminAnnouncementService.create(data);
      
      // Success
      alert("Surat Keputusan berhasil ditambahkan.");
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
      
      <AnnouncementForm
        title="Tambah Surat Keputusan"
        submitText="Simpan Data"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        errors={errors}
      />
    </div>
  );
}
