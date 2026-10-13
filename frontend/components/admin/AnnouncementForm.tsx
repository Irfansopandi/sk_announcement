"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FileText, UploadCloud, Trash2, RefreshCw, Eye, Undo2, X } from 'lucide-react';
import { Document } from '../../types';
import { getToken } from '../../lib/auth/token';

interface AnnouncementFormProps {
  initialData?: {
    sk_number: string;
    sk_date: string;
    description: string;
    status: 'draft' | 'published';
  };
  existingDocuments?: Document[];
  announcementId?: number;
  onSubmit: (data: {
    sk_number: string;
    sk_date: string;
    description: string;
    status: 'draft' | 'published';
    document?: File | null;
    delete_document?: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  title: string;
  submitText: string;
}

export default function AnnouncementForm({ 
  initialData, 
  existingDocuments,
  announcementId,
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
    status: initialData?.status || 'published',
  });

  const [existingDoc, setExistingDoc] = useState<Document | null>(
    existingDocuments && existingDocuments.length > 0 ? existingDocuments[0] : null
  );
  const [deleteExistingDoc, setDeleteExistingDoc] = useState(false);
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingDocuments && existingDocuments.length > 0) {
      setExistingDoc(existingDocuments[0]);
    }
  }, [existingDocuments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewDocument(e.target.files[0]);
      setDeleteExistingDoc(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = async (doc: Document) => {
    if (!announcementId) return;
    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const url = `${API_URL}/admin/announcements/${announcementId}/documents/${doc.id}/preview`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        handleDownload(doc);
        return;
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      handleDownload(doc);
    }
  };

  const handleDownload = async (doc: Document) => {
    if (!announcementId) return;
    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const url = `${API_URL}/admin/announcements/${announcementId}/documents/${doc.id}/download`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal mengunduh dokumen');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = window.document.createElement('a');
      a.href = blobUrl;
      a.download = doc.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert('Gagal mengunduh dokumen.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      document: newDocument,
      delete_document: deleteExistingDoc && !newDocument,
    });
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
              className={`block w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors placeholder:text-[#98A2B3] text-[#1F2937] ${
                errors.sk_number 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#096F9A] focus:border-[#096F9A] bg-white'
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
            <DatePicker
              id="sk_date"
              name="sk_date"
              selected={formData.sk_date ? new Date(formData.sk_date) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  setFormData(prev => ({ ...prev, sk_date: `${year}-${month}-${day}` }));
                } else {
                  setFormData(prev => ({ ...prev, sk_date: '' }));
                }
              }}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className={`block w-full sm:w-1/2 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors placeholder:text-[#98A2B3] text-[#1F2937] ${
                errors.sk_date 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-[#E5E7E1] focus:ring-[#096F9A] focus:border-[#096F9A] bg-white'
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

          {/* Document SK Section */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1.5">
              Dokumen SK {!initialData && !existingDoc && <span className="text-red-500">*</span>}
            </label>

            {/* Hidden actual file input */}
            <input
              ref={fileInputRef}
              type="file"
              id="document"
              name="document"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              required={!initialData && !existingDoc && !newDocument}
              className={existingDoc || newDocument ? "hidden" : "block w-full text-sm text-[#4B5563] file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F0F8FB] file:text-[#096F9A] hover:file:bg-[#E6F3F9] border border-[#E5E7E1] rounded-lg bg-white cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#096F9A]"}
            />

            {/* Case 1: Newly selected replacement/upload file */}
            {newDocument && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        {existingDoc ? 'File Pengganti (Baru)' : 'File Siap Diunggah'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1F2937] truncate mt-0.5" title={newDocument.name}>
                      {newDocument.name}
                    </p>
                    <p className="text-xs text-[#6B7C87] mt-0.5">
                      {formatFileSize(newDocument.size)} {existingDoc && '• Akan menggantikan dokumen lama saat disimpan'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Pilih Lain
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDocument(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Existing Document Marked for Deletion */}
            {!newDocument && existingDoc && deleteExistingDoc && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg shrink-0">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        Ditandai untuk Dihapus
                      </span>
                    </div>
                    <p className="text-sm font-medium text-rose-900 line-through truncate mt-0.5" title={existingDoc.file_name}>
                      {existingDoc.file_name}
                    </p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      Dokumen ini akan dihapus permanen saat data disimpan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload Pengganti
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteExistingDoc(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    Urungkan
                  </button>
                </div>
              </div>
            )}

            {/* Case 3: Existing Document Active */}
            {!newDocument && existingDoc && !deleteExistingDoc && (
              <div className="p-4 bg-gray-50 border border-[#E5E7E1] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0 border border-red-100">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Dokumen Saat Ini
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#1F2937] truncate mt-0.5" title={existingDoc.file_name}>
                      {existingDoc.file_name}
                    </p>
                    <p className="text-xs text-[#6B7C87] mt-0.5">
                      {existingDoc.file_type.includes('pdf') ? 'PDF' : 'Dokumen'} • {formatFileSize(existingDoc.file_size)} • Diunggah {new Date(existingDoc.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {announcementId && (
                    <button
                      type="button"
                      onClick={() => handlePreview(existingDoc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#096F9A] bg-[#F0F8FB] hover:bg-[#E0F2FA] rounded-lg transition-colors cursor-pointer"
                      title="Lihat / Pratinjau Dokumen"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                    title="Ganti dengan file lain"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ganti File
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteExistingDoc(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    title="Hapus dokumen ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            )}

            {/* Hint message */}
            {!existingDoc && !newDocument && (
              <p className="mt-1.5 text-xs text-[#6B7C87]">
                Format didukung: PDF, Word, Excel. Maksimal 10 MB.
              </p>
            )}

            {errors.document && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.document[0]}</p>
            )}
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
              href="/admin/announcements"
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-[#4B5563] bg-white border border-[#E5E7E1] hover:bg-[#F7F8F5] transition-colors text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold text-white bg-[#E5A822] hover:bg-[#C28B15] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E5A822] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm cursor-pointer"
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
