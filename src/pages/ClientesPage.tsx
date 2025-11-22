import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useClientesQuery } from '../api/queries/clientes.queries';
import {
  useCreateClienteMutation,
  useUpdateClienteMutation,
  useDeleteClienteMutation,
} from '../api/mutations/clientes.mutations';
import type { Cliente, ClienteCreate } from '../types';

// Schema de validación
const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(60, 'El nombre no puede exceder 60 caracteres'),
  apellido: z.string().min(1, 'El apellido es requerido').max(60, 'El apellido no puede exceder 60 caracteres'),
  email: z.string().email('Email inválido').max(120, 'El email no puede exceder 120 caracteres').optional().or(z.literal('')),
  telefono: z.string().min(1, 'El teléfono es requerido').max(20, 'El teléfono no puede exceder 20 caracteres'),
  direccion: z.string().max(255, 'La dirección no puede exceder 255 caracteres').optional().or(z.literal('')),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export const ClientesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const { data: clientes = [], isLoading } = useClientesQuery();
  const createMutation = useCreateClienteMutation();
  const updateMutation = useUpdateClienteMutation();
  const deleteMutation = useDeleteClienteMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: editingCliente
      ? {
          nombre: editingCliente.nombre,
          apellido: editingCliente.apellido,
          email: editingCliente.email,
          telefono: editingCliente.telefono,
          direccion: editingCliente.direccion,
        }
      : undefined,
  });

  const onSubmit = async (data: ClienteFormData) => {
    try {
      // Limpiar campos opcionales vacíos
      const payload: ClienteCreate = {
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        email: data.email && data.email.trim() !== '' ? data.email : undefined,
        direccion: data.direccion && data.direccion.trim() !== '' ? data.direccion : undefined,
      };

      if (editingCliente) {
        await updateMutation.mutateAsync({
          id: editingCliente.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
    reset();
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
    reset({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
    });
  };

  const handleDelete = async (cliente: Cliente) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`)) {
      try {
        await deleteMutation.mutateAsync(cliente.id);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Nombre', accessor: 'nombre' as const },
    { header: 'Apellido', accessor: 'apellido' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Teléfono', accessor: 'telefono' as const },
    {
      header: 'Dirección',
      accessor: (row: Cliente) => row.direccion || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-1">Gestiona los clientes del sistema</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Cliente
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DataTable
            data={clientes}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay clientes registrados"
          />
        </div>

        {/* Modal para crear/editar */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nombre" error={errors.nombre?.message} required htmlFor="nombre">
                <input
                  id="nombre"
                  type="text"
                  {...register('nombre')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.nombre ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>

              <FormField label="Apellido" error={errors.apellido?.message} required htmlFor="apellido">
                <input
                  id="apellido"
                  type="text"
                  {...register('apellido')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.apellido ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>
            </div>

            <FormField label="Email" error={errors.email?.message} htmlFor="email">
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <FormField label="Teléfono" error={errors.telefono?.message} required htmlFor="telefono">
              <input
                id="telefono"
                type="text"
                {...register('telefono')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.telefono ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <FormField label="Dirección" error={errors.direccion?.message} htmlFor="direccion">
              <input
                id="direccion"
                type="text"
                {...register('direccion')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.direccion ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Guardando...'
                  : editingCliente
                  ? 'Actualizar'
                  : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};
