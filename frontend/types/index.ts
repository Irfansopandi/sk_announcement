export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Announcement {
  id: number;
  sk_number: string;
  sk_date: string;
  description: string;
  status: 'draft' | 'published';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  announcement_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
