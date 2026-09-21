<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'sk_number',
        'sk_date',
        'description',
        'status',
        'created_by',
    ];

    protected $casts = [
        'sk_date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'announcement_id');
    }
}
