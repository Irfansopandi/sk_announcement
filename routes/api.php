<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\AnnouncementController as PublicAnnouncementController;
use App\Http\Controllers\Api\Admin\AnnouncementController as AdminAnnouncementController;

Route::post('/login', [AuthController::class, 'login']);

// Public routes for announcements
Route::get('/announcements', [PublicAnnouncementController::class, 'index']);
Route::get('/announcements/{id}', [PublicAnnouncementController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Admin only routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
        Route::get('/announcements/{id}', [AdminAnnouncementController::class, 'show']);
        Route::put('/announcements/{id}', [AdminAnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AdminAnnouncementController::class, 'destroy']);
        Route::patch('/announcements/{id}/status', [AdminAnnouncementController::class, 'updateStatus']);
        
        // Documents
        Route::get('/announcements/{announcement}/documents', [\App\Http\Controllers\Api\Admin\DocumentController::class, 'index']);
        Route::post('/announcements/{announcement}/documents', [\App\Http\Controllers\Api\Admin\DocumentController::class, 'store']);
        Route::get('/announcements/{announcement}/documents/{document}/preview', [\App\Http\Controllers\Api\Admin\DocumentController::class, 'preview']);
        Route::get('/announcements/{announcement}/documents/{document}/download', [\App\Http\Controllers\Api\Admin\DocumentController::class, 'download']);
        Route::get('/documents/{document}', [\App\Http\Controllers\Api\Admin\DocumentController::class, 'show']);
        Route::delete('/documents/{document}', [\App\Http\Controllers\Api\Admin\DocumentController::class, 'destroy']);
    });
});

