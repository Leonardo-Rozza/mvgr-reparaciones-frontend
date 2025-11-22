import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';
import type { Cliente } from '../../types';

// Obtener todos los clientes
const fetchClientes = async (): Promise<Cliente[]> => {
  const { data } = await apiClient.get<Cliente[]>('/clientes');
  return data;
};

// Hook para obtener clientes
export const useClientesQuery = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
  });
};

// Obtener un cliente por ID
const fetchClienteById = async (id: number): Promise<Cliente> => {
  const { data } = await apiClient.get<Cliente>(`/clientes/${id}`);
  return data;
};

// Hook para obtener un cliente por ID
export const useClienteQuery = (id: number) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => fetchClienteById(id),
    enabled: !!id,
  });
};
