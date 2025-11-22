import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useEquiposQuery } from '../api/queries/equipos.queries';
import { useClientesQuery } from '../api/queries/clientes.queries';
import {
  useCreateEquipoMutation,
  useUpdateEquipoMutation,
  useDeleteEquipoMutation,
} from '../api/mutations/equipos.mutations';
import type { Equipo, EquipoCreate } from '../types';

// Schema de validación
const equipoSchema = z.object({
  tipo: z.string().min(1, 'El tipo es requerido'),
  marca: z.string().min(1, 'La marca es requerida'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  numeroSerie: z.string().optional(),
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

export const EquiposPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);

  const { data: equipos = [], isLoading } = useEquiposQuery();
  const { data: clientes = [] } = useClientesQuery();
  const createMutation = useCreateEquipoMutation();
  const updateMutation = useUpdateEquipoMutation();
  const deleteMutation = useDeleteEquipoMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    defaultValues: editingEquipo
      ? {
          tipo: editingEquipo.tipo,
          marca: editingEquipo.marca,
          modelo: editingEquipo.modelo,
          numeroSerie: editingEquipo.numeroSerie,
          clienteId: editingEquipo.clienteId,
        }
      : undefined,
  });

  const onSubmit = async (data: EquipoFormData) => {
    try {
      if (editingEquipo) {
        await updateMutation.mutateAsync({
          id: editingEquipo.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data as EquipoCreate);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar equipo:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEquipo(null);
    reset();
  };

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    setIsModalOpen(true);
    reset({
      tipo: equipo.tipo,
      marca: equipo.marca,
      modelo: equipo.modelo,
      numeroSerie: equipo.numeroSerie,
      clienteId: equipo.clienteId,
    });
  };

  const handleDelete = async (equipo: Equipo) => {
    if (window.confirm(`¿Estás seguro de eliminar el equipo ${equipo.marca} ${equipo.modelo}?`)) {
      try {
        await deleteMutation.mutateAsync(equipo.id);
      } catch (error) {
        console.error('Error al eliminar equipo:', error);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Tipo', accessor: 'tipo' as const },
    { header: 'Marca', accessor: 'marca' as const },
    { header: 'Modelo', accessor: 'modelo' as const },
    {
      header: 'N° Serie',
      accessor: (row: Equipo) => row.numeroSerie || '-',
    },
    {
      header: 'Cliente',
      accessor: (row: Equipo) =>
        row.cliente ? `${row.cliente.nombre} ${row.cliente.apellido}` : '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>
            <p className="text-gray-600 mt-1">Gestiona los equipos de los clientes</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Equipo
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DataTable
            data={equipos}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay equipos registrados"
          />
        </div>

        {/* Modal para crear/editar */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Tipo" error={errors.tipo?.message} required htmlFor="tipo">
              <input
                id="tipo"
                type="text"
                {...register('tipo')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.tipo ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Laptop, Celular, Tablet"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Marca" error={errors.marca?.message} required htmlFor="marca">
                <input
                  id="marca"
                  type="text"
                  {...register('marca')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.marca ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>

              <FormField label="Modelo" error={errors.modelo?.message} required htmlFor="modelo">
                <input
                  id="modelo"
                  type="text"
                  {...register('modelo')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.modelo ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>
            </div>

            <FormField label="N° Serie" error={errors.numeroSerie?.message} htmlFor="numeroSerie">
              <input
                id="numeroSerie"
                type="text"
                {...register('numeroSerie')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.numeroSerie ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <FormField label="Cliente" error={errors.clienteId?.message} required htmlFor="clienteId">
              <select
                id="clienteId"
                {...register('clienteId', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.clienteId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
                  </option>
                ))}
              </select>
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
                  : editingEquipo
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
