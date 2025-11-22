import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../axios';
import type { Reparacion, ReparacionCreate, ReparacionUpdate } from '../../types';

// Crear reparación
const createReparacion = async (reparacion: ReparacionCreate): Promise<Reparacion> => {
  const { data } = await apiClient.post<Reparacion>('/reparaciones', reparacion);
  return data;
};

// Actualizar reparación
const updateReparacion = async (reparacion: ReparacionUpdate): Promise<Reparacion> => {
  const { data } = await apiClient.put<Reparacion>(`/reparaciones/${reparacion.id}`, reparacion);
  return data;
};

// Eliminar reparación
const deleteReparacion = async (id: number): Promise<void> => {
  await apiClient.delete(`/reparaciones/${id}`);
};

// Hook para crear reparación
export const useCreateReparacionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createReparacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reparaciones'] });
    },
  });
};

// Hook para actualizar reparación
export const useUpdateReparacionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateReparacion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reparaciones'] });
      queryClient.invalidateQueries({ queryKey: ['reparacion', data.id] });
    },
  });
};

// Hook para eliminar reparación
export const useDeleteReparacionMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteReparacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reparaciones'] });
    },
  });
};
