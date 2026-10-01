<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = [
        'meeting_date',
        'invitation_number',
        'description',
        'status',
        'document_name',
        'document_path',
        'document_type',
        'document_size',
        'created_by'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
