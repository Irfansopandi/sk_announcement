<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $query = Meeting::query();

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

        // Get counts before applying status filter
        $counts = [
            'published' => (clone $query)->where('status', 'published')->count(),
            'draft' => (clone $query)->where('status', 'draft')->count(),
        ];

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
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

        $perPage = $request->has('per_page') ? (int) $request->per_page : 10;
        $meetings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil data Rapat',
            'counts' => $counts,
            'data' => $meetings
        ], 200);
    }

    public function show($id)
    {
        $meeting = Meeting::find($id);

        if (!$meeting) {
            return response()->json(['success' => false, 'message' => 'Meeting not found'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail Rapat',
            'data' => $meeting
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'meeting_date' => 'required|date',
            'invitation_number' => 'required|string|max:100|unique:meetings,invitation_number',
            'description' => 'required|string',
            'status' => 'required|in:draft,published',
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240' // 10MB
        ]);

        $meeting = new Meeting();
        $meeting->meeting_date = $request->meeting_date;
        $meeting->invitation_number = $request->invitation_number;
        $meeting->description = $request->description;
        $meeting->status = $request->status;
        $meeting->created_by = $request->user()->id;

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $fileName = $file->getClientOriginalName();
            $path = $file->store('meetings', 'public');
            
            $meeting->document_name = $fileName;
            $meeting->document_path = $path;
            $meeting->document_type = $file->getClientMimeType();
            $meeting->document_size = $file->getSize();
        }

        $meeting->save();

        return response()->json([
            'success' => true,
            'message' => 'Meeting created successfully',
            'data' => $meeting
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $meeting = Meeting::find($id);

        if (!$meeting) {
            return response()->json(['success' => false, 'message' => 'Meeting not found'], 404);
        }

        $request->validate([
            'meeting_date' => 'required|date',
            'invitation_number' => ['required', 'string', 'max:100', Rule::unique('meetings', 'invitation_number')->ignore($meeting->id)],
            'description' => 'required|string',
            'status' => 'required|in:draft,published',
            'document' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240'
        ]);

        $meeting->meeting_date = $request->meeting_date;
        $meeting->invitation_number = $request->invitation_number;
        $meeting->description = $request->description;
        $meeting->status = $request->status;

        if ($request->hasFile('document')) {
            // Delete old document if exists
            if ($meeting->document_path && Storage::disk('public')->exists($meeting->document_path)) {
                Storage::disk('public')->delete($meeting->document_path);
            }

            $file = $request->file('document');
            $fileName = $file->getClientOriginalName();
            $path = $file->store('meetings', 'public');
            
            $meeting->document_name = $fileName;
            $meeting->document_path = $path;
            $meeting->document_type = $file->getClientMimeType();
            $meeting->document_size = $file->getSize();
        }

        $meeting->save();

        return response()->json([
            'success' => true,
            'message' => 'Meeting updated successfully',
            'data' => $meeting
        ]);
    }

    public function destroy($id)
    {
        $meeting = Meeting::find($id);

        if (!$meeting) {
            return response()->json(['success' => false, 'message' => 'Meeting not found'], 404);
        }

        if ($meeting->document_path && Storage::disk('public')->exists($meeting->document_path)) {
            Storage::disk('public')->delete($meeting->document_path);
        }

        $meeting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meeting deleted successfully'
        ]);
    }

    public function toggleStatus(Request $request, $id)
    {
        $meeting = Meeting::find($id);

        if (!$meeting) {
            return response()->json(['success' => false, 'message' => 'Meeting not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:draft,published'
        ]);

        $meeting->status = $request->status;
        $meeting->save();

        return response()->json([
            'success' => true,
            'message' => 'Meeting status updated successfully',
            'data' => $meeting
        ]);
    }
}
