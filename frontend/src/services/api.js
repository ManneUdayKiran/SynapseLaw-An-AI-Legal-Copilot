import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE_URL || '';
const cleanBase = rawBase.replace(/\/+$/, '');
const baseURL = cleanBase
  ? (cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`)
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 45000
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('lexiguide_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(error) {
  return error?.response?.data?.detail || error?.message || 'Something went wrong. Please try again.';
}

export default api;
