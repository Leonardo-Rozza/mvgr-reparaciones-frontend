import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { authStore } from '../store/auth.store';
import { getErrorMessage, showError } from '../utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      authStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      const method = error.config?.method?.toLowerCase();
      if (method === 'get') {
        showError(getErrorMessage(error, 'No se pudo obtener la información.'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
