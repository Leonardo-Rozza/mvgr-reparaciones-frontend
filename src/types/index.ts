// Tipos base para el proyecto

export interface User {
  username: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// ========== CLIENTE ==========
export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
}

export interface ClienteCreate {
  nombre: string;
  apellido: string;
  email?: string;
  telefono: string;
  direccion?: string;
}

export interface ClienteUpdate extends Partial<ClienteCreate> {
  id: number;
}

// ========== EQUIPO ==========
export interface Equipo {
  id: number;
  marca: string;
  modelo: string;
  imei?: string;
  color?: string;
  descripcion?: string;
  clienteId: number;
  cliente?: Cliente;
}

export interface EquipoCreate {
  marca: string;
  modelo: string;
  imei?: string;
  color?: string;
  descripcion?: string;
  clienteId: number;
}

export interface EquipoUpdate extends Partial<EquipoCreate> {
  id: number;
}

// ========== REPARACION ==========
export interface Reparacion {
  id: number;
  descripcionProblema: string;
  fechaIngreso?: string;
  fechaEstimadaEntrega?: string;
  fechaEntrega?: string;
  estado?: 'INGRESADO' | 'EN_PROCESO' | 'ESPERANDO_REPUESTO' | 'COMPLETADO' | 'ENTREGADO';
  precioEstimado?: number;
  precioFinal?: number;
  equipoId: number;
  equipo?: Equipo;
}

export interface ReparacionCreate {
  descripcionProblema: string;
  fechaIngreso?: string;
  fechaEstimadaEntrega?: string;
  fechaEntrega?: string;
  estado?: 'INGRESADO' | 'EN_PROCESO' | 'ESPERANDO_REPUESTO' | 'COMPLETADO' | 'ENTREGADO';
  precioEstimado?: number;
  precioFinal?: number;
  equipoId: number;
}

export interface ReparacionUpdate {
  id: number;
  descripcionProblema?: string;
  fechaIngreso?: string;
  fechaEstimadaEntrega?: string;
  fechaEntrega?: string;
  estado?: 'INGRESADO' | 'EN_PROCESO' | 'ESPERANDO_REPUESTO' | 'COMPLETADO' | 'ENTREGADO';
  precioEstimado?: number;
  precioFinal?: number;
  equipoId?: number;
}

// ========== REPUESTO ==========
export interface Repuesto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  reparacionId?: number;
}

export interface RepuestoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  reparacionId?: number;
}

export interface RepuestoUpdate extends Partial<RepuestoCreate> {
  id: number;
}
