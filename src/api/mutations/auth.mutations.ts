import { useMutation } from '@tanstack/react-query';
import type { LoginRequest, LoginResponse } from '../../types';
import { getErrorMessage, showError, showSuccess } from '../../utils/toast';
import { apiClient } from '../axios';

// Función para hacer login
const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  //console.log('Haciendo POST a /auth/login con:', credentials);
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    // console.log('Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    // console.error('Error en loginUser:', error);
    throw error;
  }
};

// Hook de mutación para login
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      showSuccess('Sesión iniciada correctamente');
    },
    onError: (error) => {
      showError(getErrorMessage(error, 'Credenciales inválidas o servidor no disponible'));
    },
  });
};
