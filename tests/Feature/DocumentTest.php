<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;
use App\Models\User;
use App\Models\Announcement;
use App\Models\Document;

class DocumentTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => 'admin']);
        Storage::fake('local');
    }

    public function test_preview_valid_document_success()
    {
        $announcement = Announcement::create([
            'sk_number' => 'SK/123/2026',
            'sk_date' => '2026-01-01',
            'description' => 'Test',
            'status' => 'published',
            'created_by' => $this->admin->id
        ]);

        $file = UploadedFile::fake()->create('test.pdf', 100, 'application/pdf');
        $path = $file->storeAs('documents/' . $announcement->id, 'test-uuid.pdf', 'local');

        $document = Document::create([
            'announcement_id' => $announcement->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'file_type' => 'application/pdf',
            'file_size' => 100
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/announcements/{$announcement->id}/documents/{$document->id}/preview");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_download_valid_document_success()
    {
        $announcement = Announcement::create([
            'sk_number' => 'SK/124/2026',
            'sk_date' => '2026-01-01',
            'description' => 'Test',
            'status' => 'published',
            'created_by' => $this->admin->id
        ]);

        $file = UploadedFile::fake()->create('test.pdf', 100, 'application/pdf');
        $path = $file->storeAs('documents/' . $announcement->id, 'test-uuid.pdf', 'local');

        $document = Document::create([
            'announcement_id' => $announcement->id,
            'file_name' => 'test.pdf',
            'file_path' => $path,
            'file_type' => 'application/pdf',
            'file_size' => 100
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/announcements/{$announcement->id}/documents/{$document->id}/download");

        $response->assertStatus(200);
        $response->assertHeader('Content-Disposition', 'attachment; filename=test.pdf');
    }

    public function test_document_belongs_to_another_announcement_returns_404()
    {
        $announcement1 = Announcement::create(['sk_number' => 'SK/1', 'sk_date' => '2026-01-01', 'status' => 'published', 'description' => '1', 'created_by' => $this->admin->id]);
        $announcement2 = Announcement::create(['sk_number' => 'SK/2', 'sk_date' => '2026-01-01', 'status' => 'published', 'description' => '2', 'created_by' => $this->admin->id]);

        $document = Document::create([
            'announcement_id' => $announcement2->id,
            'file_name' => 'test.pdf',
            'file_path' => 'fake',
            'file_type' => 'application/pdf',
            'file_size' => 100
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/announcements/{$announcement1->id}/documents/{$document->id}/preview");

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Dokumen bukan milik SK ini']);
    }

    public function test_document_not_found_returns_404()
    {
        $announcement = Announcement::create(['sk_number' => 'SK/3', 'sk_date' => '2026-01-01', 'status' => 'published', 'description' => '1', 'created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/announcements/{$announcement->id}/documents/999/preview");

        $response->assertStatus(404);
    }

    public function test_physical_file_not_found_returns_404()
    {
        $announcement = Announcement::create(['sk_number' => 'SK/4', 'sk_date' => '2026-01-01', 'status' => 'published', 'description' => '1', 'created_by' => $this->admin->id]);

        $document = Document::create([
            'announcement_id' => $announcement->id,
            'file_name' => 'test.pdf',
            'file_path' => 'documents/missing/missing.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 100
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/announcements/{$announcement->id}/documents/{$document->id}/preview");

        $response->assertStatus(404);
        $response->assertJson(['message' => 'File fisik dokumen tidak ditemukan.']);
    }

    public function test_unauthorized_access_returns_401()
    {
        $response = $this->getJson("/api/admin/announcements/1/documents/1/preview");
        $response->assertStatus(401);
    }
}
