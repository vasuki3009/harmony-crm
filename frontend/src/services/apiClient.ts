/**
 * Small fetch wrapper for the Spring Boot backend.
 *  - Base URL comes from VITE_API_URL (leave it empty to run on the built-in mock data).
 *  - Adds the JWT as "Authorization: Bearer <token>" when the user is logged in.
 *  - Turns error responses into ApiError and handles 204 No Content.
 */
const rawUrl = import.meta.env.VITE_API_URL as string | undefined;
export const API_URL = rawUrl ? rawUrl.replace(/\/$/, '') : '';
export const isApiEnabled = API_URL !== '';

const TOKEN_KEY = 'crm_token';

export const tokenStore = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

/** Fired when the server answers 401 for a logged-in user (expired / invalid token). */
export const UNAUTHORIZED_EVENT = 'crm:unauthorized';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      /* body was not JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
