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
  email: string;
  telefono: string;
  direccion?: string;
}

export interface ClienteUpdate extends Partial<ClienteCreate> {
  id: number;
}

// ========== EQUIPO ==========
export interface Equipo {
  id: number;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  clienteId: number;
  cliente?: Cliente;
}

export interface EquipoCreate {
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie?: string;
  clienteId: number;
}

export interface EquipoUpdate extends Partial<EquipoCreate> {
  id: number;
}

// ========== REPARACION ==========
export interface Reparacion {
  id: number;
  descripcion: string;
  fechaIngreso: string;
  fechaSalida?: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  costo?: number;
  equipoId: number;
  equipo?: Equipo;
}

export interface ReparacionCreate {
  descripcion: string;
  fechaIngreso: string;
  fechaSalida?: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';
  costo?: number;
  equipoId: number;
}

export interface ReparacionUpdate extends Partial<ReparacionCreate> {
  id: number;
}

// ========== REPUESTO ==========
export interface Repuesto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
}

export interface RepuestoCreate {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
}

export interface RepuestoUpdate extends Partial<RepuestoCreate> {
  id: number;
}
