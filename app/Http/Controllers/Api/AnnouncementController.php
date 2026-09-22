<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::where('status', 'published');

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

        $sort = $request->get('sort', 'terbaru');
        if ($sort === 'terlama') {
            $query->orderBy('sk_date', 'asc');
        } else {
            $query->orderBy('sk_date', 'desc');
        }

        $announcements = $query->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mengambil data SK published',
            'data' => $announcements
        ], 200);
    }

    public function show($id)
    {
        $announcement = Announcement::where('id', $id)
            ->where('status', 'published')
            ->first();

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
}
