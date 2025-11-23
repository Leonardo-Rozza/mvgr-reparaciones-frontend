import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { useLoginMutation } from '../api/mutations/auth.mutations';
import { useAuth } from '../store/auth.store';

const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido').min(3, 'Debe tener al menos 3 caracteres'),
  password: z.string().min(1, 'La contraseña es requerida').min(4, 'Debe tener al menos 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const inputClasses = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:text-gray-100 ${
    hasError ? 'border-red-300 dark:border-red-400' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-900'
  }`;

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
      const response = await loginMutation.mutateAsync(data);
      const extraFields = response as unknown as Record<string, unknown>;
      const token =
        response.token ||
        (typeof extraFields.accessToken === 'string' ? (extraFields.accessToken as string) : undefined) ||
        (typeof extraFields.jwt === 'string' ? (extraFields.jwt as string) : undefined);
      const username =
        response.username ||
        (typeof extraFields.user === 'string' ? (extraFields.user as string) : undefined) ||
        (typeof extraFields.userName === 'string' ? (extraFields.userName as string) : undefined) ||
        data.username;

      if (!token) {
        setErrorMessage('El servidor no devolvió un token de autenticación.');
        return;
      }

      login(token, username);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: { message?: string; error?: string };
            statusText?: string;
          };
          message?: string;
        };

        const message =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.response?.statusText ||
          axiosError.message ||
          'Error al iniciar sesión. Verifica tus credenciales.';

        setErrorMessage(message);
      } else if (error && typeof error === 'object' && 'message' in error) {
        setErrorMessage((error as { message?: string }).message || 'Error de conexión. Verifica que el backend esté disponible.');
      } else {
        setErrorMessage('Error al iniciar sesión. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-white to-white px-4 py-8 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 lg:flex-row lg:justify-between">
        <div className="w-full max-w-md space-y-4 text-center lg:text-left">
          <p className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-200">
            MVGR Reparaciones
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Bienvenido al panel administrativo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona clientes, equipos, reparaciones y repuestos desde un solo lugar. Inicia sesión para continuar.
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Iniciar sesión</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {errorMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username')}
                className={inputClasses(!!errors.username)}
                placeholder="Ingresa tu usuario"
                disabled={isSubmitting}
              />
              {errors.username && <p className="text-sm text-red-500 dark:text-red-400">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={inputClasses(!!errors.password)}
                placeholder="Ingresa tu contraseña"
                disabled={isSubmitting}
              />
              {errors.password && <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
