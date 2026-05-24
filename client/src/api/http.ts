const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {})
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.error || 'Request failed';
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function apiFetchForm<T>(path: string, form: FormData, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    body: form,
    ...init,
    credentials: 'include'
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.error || 'Request failed';
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function apiUrl() {
  return API_URL;
}
