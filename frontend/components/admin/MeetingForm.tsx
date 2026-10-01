"use client";

import { useState } from 'react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface MeetingFormProps {
  initialData?: {
    invitation_number: string;
    meeting_date: string;
    description: string;
    status: 'draft' | 'published';
  };
  onSubmit: (data: {
    invitation_number: string;
    meeting_date: string;
    description: string;
    status: 'draft' | 'published';
    document?: File | null;
  }) => Promise<void>;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  title: string;
  submitText: string;
}

export default function MeetingForm({ 
  initialData, 
  onSubmit, 
  isSubmitting, 
  errors,
  title,
  submitText
}: MeetingFormProps) {
  
  const [formData, setFormData] = useState({
    invitation_number: initialData?.invitation_number || '',
    meeting_date: initialData?.meeting_date || '',
    description: initialData?.description || '',
    status: initialData?.status || 'published',
    document: null as File | null
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, document: e.target.files![0] }));
    }
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
          
          {/* Rapat Number */}
          <div>
            <label htmlFor="invitation_number" className="block text-sm font-medium text-[#1F2937] mb-1">
              No. Rapat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="invitation_number"
              name="invitation_number"
              value={formData.invitation_number}
              onChange={handleChange}
              maxLength={100}
              placeholder="Masukkan Nomor Surat Undangan"
              className={`block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors placeholder:text-[#98A2B3] text-[#1F2937] ${
                errors.invitation_number 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#096F9A] focus:border-[#096F9A] bg-white'
              }`}
              required
            />
            {errors.invitation_number && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.invitation_number[0]}</p>
            )}
          </div>

          {/* Rapat Date */}
          <div>
            <label htmlFor="meeting_date" className="block text-sm font-medium text-[#1F2937] mb-1">
              Tanggal Rapat <span className="text-red-500">*</span>
            </label>
            <DatePicker
              id="meeting_date"
              name="meeting_date"
              selected={formData.meeting_date ? new Date(formData.meeting_date) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  // Format as YYYY-MM-DD for backend
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setFormData(prev => ({ ...prev, meeting_date: `${year}-${month}-${day}` }));
                } else {
                  setFormData(prev => ({ ...prev, meeting_date: '' }));
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className={`block w-full sm:w-1/2 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors placeholder:text-[#98A2B3] text-[#1F2937] ${
                errors.meeting_date 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#096F9A] focus:border-[#096F9A] bg-white'
              }`}
              required
            />
            {errors.meeting_date && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.meeting_date[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#1F2937] mb-1">
              Tentang <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Masukkan tentang atau perihal Surat Keputusan"
              className={`block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors resize-y min-h-[100px] placeholder:text-[#98A2B3] text-[#1F2937] ${
                errors.description 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#096F9A] focus:border-[#096F9A] bg-white'
              }`}
              required
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.description[0]}</p>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-[#1F2937] mb-1">
              Dokumen Rapat {!initialData && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              id="document"
              name="document"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              required={!initialData}
              className="block w-full text-sm text-[#4B5563] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F0F8FB] file:text-[#096F9A] hover:file:bg-[#E6F3F9] border border-[#E5E7E1] rounded-lg bg-white cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#096F9A]"
            />
            <p className="mt-1.5 text-xs text-[#6B7C87]">
              Format didukung: PDF, Word, Excel. Maksimal 10 MB.
            </p>
          </div>

          {/* Status Dropdown */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-[#1F2937] mb-1">
              Status Publikasi <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`block w-full sm:w-1/2 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors border-[#E5E7E1] focus:ring-[#096F9A] focus:border-[#096F9A] bg-white text-[#1F2937]`}
            >
              <option value="published">Publish</option>
              <option value="draft">Rahasia</option>
            </select>
            {errors.status && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.status[0]}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-[#E5E7E1] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Link 
              href="/admin/notulensi"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-[#4B5563] bg-white border border-[#E5E7E1] hover:bg-[#F7F8F5] transition-colors text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white bg-[#E5A822] hover:bg-[#C28B15] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E5A822] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
