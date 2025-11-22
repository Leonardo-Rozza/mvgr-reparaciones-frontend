import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../axios';
import type { Equipo } from '../../types';

// Obtener todos los equipos
const fetchEquipos = async (): Promise<Equipo[]> => {
  const { data } = await apiClient.get<Equipo[]>('/equipos');
  return data;
};

// Hook para obtener equipos
export const useEquiposQuery = () => {
  return useQuery({
    queryKey: ['equipos'],
    queryFn: fetchEquipos,
  });
};

// Obtener un equipo por ID
const fetchEquipoById = async (id: number): Promise<Equipo> => {
  const { data } = await apiClient.get<Equipo>(`/equipos/${id}`);
  return data;
};

// Hook para obtener un equipo por ID
export const useEquipoQuery = (id: number) => {
  return useQuery({
    queryKey: ['equipo', id],
    queryFn: () => fetchEquipoById(id),
    enabled: !!id,
  });
};
