"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { adminDocumentService } from '../../lib/api/documents';
import { ApiError } from '../../lib/api/client';
import { Document } from '../../types';
import { getToken } from '../../lib/auth/token';

interface DocumentManagerProps {
  announcementId: number;
}

export default function DocumentManager({ announcementId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete states
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await adminDocumentService.getAllByAnnouncement(announcementId);
      setDocuments(res.data || []);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError("Sesi telah habis. Silakan login kembali.");
        else if (err.status === 403) setError("Akses ditolak.");
        else if (err.status === 404) setError("SK tidak ditemukan.");
        else setError("Gagal memuat dokumen.");
      } else {
        setError("Kesalahan koneksi internet.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [announcementId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, [fetchDocuments]);

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return "Format file tidak didukung. Harap unggah file PDF.";
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return `Ukuran file terlalu besar (Maksimal 10MB). Ukuran saat ini: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    try {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(10); // Fake initial progress
      
      const res = await adminDocumentService.upload(announcementId, file);
      setUploadProgress(100);
      
      if (res.data) {
        setDocuments(prev => [...prev, res.data!]);
      } else {
        fetchDocuments(); // Refresh if data not returned perfectly
      }
      
      alert("Dokumen berhasil diunggah.");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422 && err.data) {
          const errData = err.data as Record<string, unknown>;
          setUploadError((errData.message as string) || "Validasi gagal dari server.");
        } else if (err.status === 413) {
          setUploadError("Ukuran file melebihi batas server.");
        } else {
          setUploadError(err.message || "Gagal mengunggah dokumen.");
        }
      } else {
        setUploadError("Kesalahan jaringan saat mengunggah.");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await adminDocumentService.delete(deleteId);
      setDocuments(prev => prev.filter(d => d.id !== deleteId));
      setDeleteId(null);
      setDocumentToDelete(null);
      alert("Dokumen berhasil dihapus.");
    } catch {
      setDeleteError("Gagal menghapus dokumen. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreview = async (doc: Document) => {
    try {
      const token = getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const url = `${API_URL}/admin/announcements/${announcementId}/documents/${doc.id}/preview`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Gagal membuka preview');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      alert('Gagal memuat dokumen untuk pratinjau.');
    }
  };

  const handleDownload = async (doc: Document) => {
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
    } catch (err) {
      alert('Gagal mengunduh dokumen.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1F2937]">Dokumen Lampiran</h2>
      </div>

      {/* Upload Area */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E7E1] shadow-sm">
        <h3 className="text-sm font-medium text-[#1F2937] mb-4">Unggah Dokumen Baru</h3>
        
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-600">
            <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{uploadError}</p>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-[#266210] bg-[#EEF5EA]' 
              : 'border-[#E5E7E1] hover:bg-[#F7F8F5] bg-white'
          } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf"
            className="hidden" 
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-[#266210] text-white' : 'bg-[#F7F8F5] text-[#98A2B3]'}`}>
              {isUploading ? (
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#1F2937]">
                {isUploading ? 'Mengunggah...' : 'Klik untuk unggah atau seret dan lepas'}
              </p>
              <p className="text-xs text-[#4B5563] mt-1">PDF hingga 10MB</p>
            </div>
            
            {isUploading && uploadProgress > 0 && (
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5 mt-4">
                <div className="bg-[#266210] h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7E1] shadow-sm overflow-hidden">
        {error ? (
           <div className="p-8 text-center text-red-500">
             <p>{error}</p>
             <button onClick={fetchDocuments} className="mt-4 text-sm font-medium text-[#266210] hover:underline">Coba lagi</button>
           </div>
        ) : isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-16 bg-gray-100 rounded-lg w-full"></div>
            <div className="h-16 bg-gray-100 rounded-lg w-full"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-[#E5E7E1] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[#4B5563]">Belum ada dokumen yang diunggah.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E7E1]">
            {documents.map((doc) => (
              <li key={doc.id} className="p-4 sm:p-5 hover:bg-[#F7F8F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 truncate">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-[#1F2937] truncate">{doc.file_name}</p>
                    <p className="text-xs text-[#4B5563] mt-0.5">
                      PDF • {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePreview(doc)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-[#266210] bg-[#EEF5EA] hover:bg-[#E0EED9] rounded-lg transition-colors"
                  >
                    Lihat
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-[#1F2937] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Unduh
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(doc.id);
                      setDocumentToDelete(doc);
                    }}
                    className="inline-flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                    aria-label="Hapus dokumen"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-xl max-w-sm w-full p-6" role="dialog" aria-modal="true">
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-2 bg-red-100 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="w-full">
                <h3 className="text-lg font-semibold text-[#1F2937]">Hapus Dokumen?</h3>
                <p className="mt-2 text-sm text-[#4B5563]">
                  Apakah Anda yakin ingin menghapus dokumen ini?
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-[#1F2937] truncate" title={documentToDelete.file_name}>
                    {documentToDelete.file_name}
                  </p>
                </div>
                {deleteError && (
                  <p className="mt-2 text-sm font-medium text-red-600">{deleteError}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteId(null);
                  setDocumentToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#E5E7E1] rounded-lg text-sm font-medium text-[#4B5563] hover:bg-[#F7F8F5] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
