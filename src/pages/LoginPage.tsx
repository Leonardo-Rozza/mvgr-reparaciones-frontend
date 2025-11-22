import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { useLoginMutation } from '../api/mutations/auth.mutations';
import { useAuth } from '../store/auth.store';
import { useState } from 'react';

// Schema de validación con Zod
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      console.log('Intentando login con:', { username: data.username });
      console.log('URL base:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');
      
      const response = await loginMutation.mutateAsync(data);
      console.log('Respuesta del login:', response);
      
      // Manejar diferentes estructuras de respuesta del backend
      // Puede venir como: { token, username } o { accessToken, user } o { jwt, username } etc.
      const token = response.token || (response as any).accessToken || (response as any).jwt || (response as any).token;
      const username = response.username || (response as any).user || (response as any).userName || data.username;
      
      if (!token) {
        console.error('No se recibió token en la respuesta:', response);
        setErrorMessage('Error: El servidor no devolvió un token de autenticación.');
        return;
      }
      
      // Guardar token y usuario en Zustand
      login(token, username);
      
      // Redirigir al dashboard
      navigate('/dashboard', { replace: true });
    } catch (error: unknown) {
      console.error('Error completo en login:', error);
      
      // Manejar errores
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number;
            data?: { message?: string; error?: string };
            statusText?: string;
          };
          message?: string;
        };
        
        console.error('Status:', axiosError.response?.status);
        console.error('Data:', axiosError.response?.data);
        
        const errorMsg = 
          axiosError.response?.data?.message || 
          axiosError.response?.data?.error ||
          axiosError.response?.statusText ||
          `Error ${axiosError.response?.status || 'desconocido'}` ||
          'Error al iniciar sesión. Verifica tus credenciales.';
        
        setErrorMessage(errorMsg);
      } else if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message?: string };
        setErrorMessage(err.message || 'Error de conexión. Verifica que el backend esté corriendo.');
      } else {
        setErrorMessage('Error al iniciar sesión. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Reparaciones
          </h2>
          <p className="text-gray-600">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Mensaje de error */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Campo Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.username
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Ingresa tu usuario"
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${
                  errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Ingresa tu contraseña"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          <p>Acceso restringido - Solo personal autorizado</p>
        </div>
      </div>
    </div>
  );
};

