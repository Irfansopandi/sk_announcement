"use client";

import { useState } from 'react';
import Link from 'next/link';

interface AnnouncementFormProps {
  initialData?: {
    sk_number: string;
    sk_date: string;
    description: string;
    status: 'draft' | 'published';
  };
  onSubmit: (data: {
    sk_number: string;
    sk_date: string;
    description: string;
    status: 'draft' | 'published';
  }) => Promise<void>;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  title: string;
  submitText: string;
}

export default function AnnouncementForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  errors,
  title,
  submitText
}: AnnouncementFormProps) {
  
  const [formData, setFormData] = useState({
    sk_number: initialData?.sk_number || '',
    sk_date: initialData?.sk_date || '',
    description: initialData?.description || '',
    status: initialData?.status || 'draft'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'draft' ? 'published' : 'draft'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">{title}</h1>
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7E1] shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* SK Number */}
          <div>
            <label htmlFor="sk_number" className="block text-sm font-medium text-[#1F2937] mb-1">
              No. SK <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="sk_number"
              name="sk_number"
              value={formData.sk_number}
              onChange={handleChange}
              maxLength={100}
              placeholder="Masukkan Nomor Surat Keputusan"
              className={`block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                errors.sk_number 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#266210] focus:border-[#266210] bg-white'
              }`}
              required
            />
            {errors.sk_number && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.sk_number[0]}</p>
            )}
          </div>

          {/* SK Date */}
          <div>
            <label htmlFor="sk_date" className="block text-sm font-medium text-[#1F2937] mb-1">
              Tanggal SK <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="sk_date"
              name="sk_date"
              value={formData.sk_date}
              onChange={handleChange}
              className={`block w-full sm:w-1/2 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                errors.sk_date 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#266210] focus:border-[#266210] bg-white'
              }`}
              required
            />
            {errors.sk_date && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.sk_date[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#1F2937] mb-1">
              Keterangan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Masukkan keterangan atau perihal Surat Keputusan"
              className={`block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors resize-y min-h-[100px] ${
                errors.description 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#266210] focus:border-[#266210] bg-white'
              }`}
              required
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.description[0]}</p>
            )}
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-3">
              Status Publikasi
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                role="switch"
                aria-checked={formData.status === 'published'}
                aria-label="Toggle status publikasi"
                onClick={handleToggle}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#266210] focus:ring-offset-2 ${
                  formData.status === 'published' ? 'bg-[#266210]' : 'bg-[#98A2B3]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.status === 'published' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${
                formData.status === 'published' ? 'text-[#266210]' : 'text-[#4B5563]'
              }`}>
                {formData.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            {errors.status && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.status[0]}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#E5E7E1] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Link 
              href="/admin/announcements"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-[#4B5563] bg-white border border-[#E5E7E1] hover:bg-[#F7F8F5] transition-colors text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white bg-[#266210] hover:bg-[#1E4F0D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#266210] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Menyimpan...' : submitText}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
