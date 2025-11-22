import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';
import type { Reparacion } from '../../types';

// Obtener todas las reparaciones
const fetchReparaciones = async (): Promise<Reparacion[]> => {
  const { data } = await apiClient.get<Reparacion[]>('/reparaciones');
  return data;
};

// Hook para obtener reparaciones
export const useReparacionesQuery = () => {
  return useQuery({
    queryKey: ['reparaciones'],
    queryFn: fetchReparaciones,
  });
};

// Obtener una reparación por ID
const fetchReparacionById = async (id: number): Promise<Reparacion> => {
  const { data } = await apiClient.get<Reparacion>(`/reparaciones/${id}`);
  return data;
};

// Hook para obtener una reparación por ID
export const useReparacionQuery = (id: number) => {
  return useQuery({
    queryKey: ['reparacion', id],
    queryFn: () => fetchReparacionById(id),
    enabled: !!id,
  });
};
