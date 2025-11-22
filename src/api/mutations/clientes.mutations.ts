import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';
import type { Cliente, ClienteCreate, ClienteUpdate } from '../../types';

// Crear cliente
const createCliente = async (cliente: ClienteCreate): Promise<Cliente> => {
  const { data } = await apiClient.post<Cliente>('/clientes', cliente);
  return data;
};

// Actualizar cliente
const updateCliente = async (cliente: ClienteUpdate): Promise<Cliente> => {
  const { data } = await apiClient.put<Cliente>(`/clientes/${cliente.id}`, cliente);
  return data;
};

// Eliminar cliente
const deleteCliente = async (id: number): Promise<void> => {
  await apiClient.delete(`/clientes/${id}`);
};

// Hook para crear cliente
export const useCreateClienteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

// Hook para actualizar cliente
export const useUpdateClienteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCliente,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', data.id] });
    },
  });
};

// Hook para eliminar cliente
export const useDeleteClienteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};
