<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        // Only return published meetings
        $query = Meeting::where('status', 'published');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invitation_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('year') && !empty($request->year)) {
            $query->whereYear('meeting_date', $request->year);
        }

        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'tanggal terlama':
                    $query->orderBy('meeting_date', 'asc');
                    break;
                case 'tanggal terbaru':
                    $query->orderBy('meeting_date', 'desc');
                    break;
                case 'nomor undangan':
                    $query->orderBy('invitation_number', 'asc');
                    break;
                default:
                    $query->orderBy('meeting_date', 'desc');
            }
        } else {
            $query->orderBy('meeting_date', 'desc');
        }

        $meetings = $query->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil data Rapat',
            'data' => $meetings
        ], 200);
    }

    public function show($id)
    {
        $meeting = Meeting::where('status', 'published')->find($id);

        if (!$meeting) {
            return response()->json([
                'success' => false,
                'message' => 'Data Rapat tidak ditemukan atau belum dipublikasikan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil detail Rapat',
            'data' => $meeting
        ], 200);
    }

    public function downloadDocument($id)
    {
        $meeting = Meeting::where('status', 'published')->find($id);

        if (!$meeting) {
            return response()->json([
                'success' => false,
                'message' => 'Data Rapat tidak ditemukan'
            ], 404);
        }

        if (!$meeting->document_path || !Storage::disk('public')->exists($meeting->document_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Dokumen Rapat tidak ditemukan'
            ], 404);
        }

        $filePath = Storage::disk('public')->path($meeting->document_path);

        return response()->download($filePath, $meeting->document_name, [
            'Content-Type' => $meeting->document_type
        ]);
    }
}
