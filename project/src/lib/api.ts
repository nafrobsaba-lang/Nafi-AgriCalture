import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

async function request(path: string, options: RequestInit = {}) {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  auth: {
    register: (body: object) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: object) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return request(`/products${qs}`);
    },
    my: () => request('/products/my'),
    get: (id: string) => request(`/products/${id}`),
    create: (body: object) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: object) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    create: (body: object) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
  reviews: {
    forUser: (userId: string) => request(`/reviews/user/${userId}`),
    create: (body: object) => request('/reviews', { method: 'POST', body: JSON.stringify(body) }),
  },
  users: {
    me: () => request('/users/me'),
    update: (body: object) => request('/users/me', { method: 'PUT', body: JSON.stringify(body) }),
    farmers: () => request('/users/farmers'),
    stats: () => request('/users/stats'),
  },
};
