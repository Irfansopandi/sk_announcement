<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sk_number' => 'required|string|max:100',
            'sk_date' => 'required|date',
            'description' => 'required|string',
            'status' => 'required|in:draft,published',
        ];
    }
}
