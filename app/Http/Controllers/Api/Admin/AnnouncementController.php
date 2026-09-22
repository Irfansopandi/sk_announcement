<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAnnouncementRequest;
use App\Http\Requests\UpdateAnnouncementRequest;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('sk_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('year') && !empty($request->year)) {
            $query->whereYear('sk_date', $request->year);
        }

        if ($request->has('status') && !empty($request->status)) {
            $query->where('status', $request->status);
        }

        $sort = $request->get('sort', 'tanggal terbaru');
        if ($sort === 'tanggal terlama') {
            $query->orderBy('sk_date', 'asc');
        } elseif ($sort === 'nomor SK') {
            $query->orderBy('sk_number', 'asc');
        } else {
            // default tanggal terbaru
            $query->orderBy('sk_date', 'desc');
        }

        $announcements = $query->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil data SK',
            'data' => $announcements
        ], 200);
    }

    public function store(StoreAnnouncementRequest $request)
    {
        $validated = $request->validated();
        
        // Add created_by from the authenticated user
        $validated['created_by'] = $request->user()->id;

        $announcement = Announcement::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'SK berhasil ditambahkan',
            'data' => $announcement
        ], 201);
    }

    public function show($id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil detail SK',
            'data' => $announcement
        ], 200);
    }

    public function update(UpdateAnnouncementRequest $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $validated = $request->validated();
        
        // Remove created_by if someone tries to inject it, though FormRequest already filters it out
        if (isset($validated['created_by'])) {
            unset($validated['created_by']);
        }

        $announcement->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'SK berhasil diperbarui',
            'data' => $announcement
        ], 200);
    }

    public function destroy($id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'SK berhasil dihapus'
        ], 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'success' => false,
                'message' => 'SK tidak ditemukan'
            ], 404);
        }

        $request->validate([
            'status' => 'required|in:draft,published'
        ]);

        $announcement->update([
            'status' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status SK berhasil diperbarui',
            'data' => $announcement
        ], 200);
    }
}
