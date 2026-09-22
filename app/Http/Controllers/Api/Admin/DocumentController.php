<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDocumentRequest;
use App\Models\Announcement;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    public function index($announcementId)
    {
        $announcement = Announcement::find($announcementId);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $documents = $announcement->documents;

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil daftar dokumen SK',
            'data' => $documents
        ], 200);
    }

    public function store(StoreDocumentRequest $request, $announcementId)
    {
        $announcement = Announcement::find($announcementId);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $file = $request->file('file');
        
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $fileType = $file->getMimeType();
        
        // Generate unique path
        $extension = $file->getClientOriginalExtension();
        $uniqueName = Str::uuid() . '.' . $extension;
        
        // Store the file using Laravel Storage
        $filePath = $file->storeAs('documents/' . $announcement->id, $uniqueName, 'local');

        $document = Document::create([
            'announcement_id' => $announcement->id,
            'file_name' => $originalName,
            'file_path' => $filePath,
            'file_type' => $fileType,
            'file_size' => $fileSize,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dokumen berhasil diunggah',
            'data' => $document
        ], 201);
    }

    public function show($id)
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil detail dokumen',
            'data' => $document
        ], 200);
    }

    public function destroy($id)
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen tidak ditemukan'
            ], 404);
        }

        // Delete physical file first
        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        // Delete database record
        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dokumen berhasil dihapus'
        ], 200);
    }
    public function preview($announcementId, $documentId)
    {
        $announcement = Announcement::find($announcementId);
        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $document = Document::find($documentId);
        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen PDF tidak ditemukan.'
            ], 404);
        }

        if ($document->announcement_id != $announcement->id) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen bukan milik SK ini'
            ], 404);
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File fisik dokumen tidak ditemukan.'
            ], 404);
        }

        if ($document->file_type !== 'application/pdf') {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen bukan file PDF.'
            ], 422);
        }

        $path = Storage::disk('local')->path($document->file_path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . basename($document->file_name) . '"'
        ]);
    }

    public function download($announcementId, $documentId)
    {
        $announcement = Announcement::find($announcementId);
        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $document = Document::find($documentId);
        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen PDF tidak ditemukan.'
            ], 404);
        }

        if ($document->announcement_id != $announcement->id) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen bukan milik SK ini'
            ], 404);
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File fisik dokumen tidak ditemukan.'
            ], 404);
        }

        $path = Storage::disk('local')->path($document->file_path);

        return response()->download($path, basename($document->file_name), [
            'Content-Type' => $document->file_type,
            'Content-Disposition' => 'attachment; filename="' . basename($document->file_name) . '"'
        ]);
    }
}
