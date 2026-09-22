import { getToken } from '../auth/token';

export class ApiError extends Error {
  public status: number;
  public data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetchClient<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, headers, ...customConfig } = config;
  
  let url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getToken();
  
  const defaultHeaders: HeadersInit = {
    'Accept': 'application/json',
  };

  // Only set Content-Type to application/json if it's not FormData
  if (!(customConfig.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    throw new ApiError(errorData.message || 'An error occurred', response.status, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
}
