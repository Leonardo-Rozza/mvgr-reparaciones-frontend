import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { authStore } from '../store/auth.store';

// URL base de la API (ajustar según tu backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Log de configuración al iniciar
console.log('🔧 Configuración de API:', {
  API_BASE_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});

// Crear instancia de Axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitudes: agrega el token JWT automáticamente
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().token;
    
    // Log para debugging
    console.log('🌐 Petición Axios:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
    });
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: maneja errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ Error en respuesta:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      data: error.response?.data,
      message: error.message,
    });
    
    // Si el token expiró o es inválido (401), hacer logout
    if (error.response?.status === 401) {
      authStore.getState().logout();
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

