<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->date('meeting_date')->index();
            $table->string('invitation_number', 100)->unique();
            $table->text('description');
            $table->enum('status', ['draft', 'published'])->index()->default('published');
            $table->string('document_name', 255)->nullable();
            $table->string('document_path', 255)->nullable();
            $table->string('document_type', 50)->nullable();
            $table->unsignedBigInteger('document_size')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
