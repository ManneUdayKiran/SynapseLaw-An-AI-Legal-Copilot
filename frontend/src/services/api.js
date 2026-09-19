import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
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
