<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sk_number' => 'required|string|max:100|unique:announcements,sk_number',
            'sk_date' => 'required|date',
            'description' => 'required|string',
            'status' => 'required|in:draft,published',
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'sk_number.unique' => 'Nomor SK ini sudah digunakan oleh SK lain. Silakan gunakan nomor SK yang berbeda.',
        ];
    }
}
