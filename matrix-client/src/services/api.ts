import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : '/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('matrix:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('matrix:token');
      localStorage.removeItem('matrix:user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
