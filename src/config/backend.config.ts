// Backend API Configuration — CHỈ dùng phía server (API routes).
// Đặt trong .env.local hoặc Vercel Environment Variables:
// BACKEND_API_URL=https://your-backend-host:port
// Không dùng tiền tố NEXT_PUBLIC_ — sẽ bị nhúng IP/port vào JS trình duyệt.

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function resolveBackendBase(): string {
  if (typeof window !== 'undefined') return '';
  const raw = typeof process !== 'undefined' ? String(process.env.BACKEND_API_URL || '').trim() : '';
  return normalizeBaseUrl(raw);
}

/** @deprecated Dùng getBackendUrl() — giá trị này chỉ phản ánh lúc module load */
export const BACKEND_API_URL = resolveBackendBase();

/** Base URL backend (không có path) — dùng cho client kiểu `base + '/api/...'` */
export function getBackendBaseUrl(): string {
  return normalizeBaseUrl(resolveBackendBase());
}

/**
 * Lấy URL đầy đủ cho backend API endpoint
 * @param endpoint - API endpoint (ví dụ: '/api/auth/login')
 * @returns URL đầy đủ
 */
export const getBackendUrl = (endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = normalizeBaseUrl(resolveBackendBase());
  return `${base}${normalizedEndpoint}`;
};

/**
 * Helper function để gọi backend API với error handling
 */
export const callBackendAPI = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = getBackendUrl(endpoint);
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

