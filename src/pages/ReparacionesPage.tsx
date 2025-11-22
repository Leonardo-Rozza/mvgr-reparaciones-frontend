import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useReparacionesQuery } from '../api/queries/reparaciones.queries';
import { useEquiposQuery } from '../api/queries/equipos.queries';
import {
  useCreateReparacionMutation,
  useUpdateReparacionMutation,
  useDeleteReparacionMutation,
} from '../api/mutations/reparaciones.mutations';
import type { Reparacion, ReparacionCreate } from '../types';

// Schema de validación
const reparacionSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida'),
  fechaIngreso: z.string().min(1, 'La fecha de ingreso es requerida'),
  fechaSalida: z.string().optional(),
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA']),
  costo: z.number().min(0).optional().or(z.literal('')),
  equipoId: z.number().min(1, 'Debe seleccionar un equipo'),
});

type ReparacionFormData = z.infer<typeof reparacionSchema>;

const estadoColors = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  COMPLETADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800',
};

export const ReparacionesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReparacion, setEditingReparacion] = useState<Reparacion | null>(null);

  const { data: reparaciones = [], isLoading } = useReparacionesQuery();
  const { data: equipos = [] } = useEquiposQuery();
  const createMutation = useCreateReparacionMutation();
  const updateMutation = useUpdateReparacionMutation();
  const deleteMutation = useDeleteReparacionMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReparacionFormData>({
    resolver: zodResolver(reparacionSchema),
    defaultValues: editingReparacion
      ? {
          descripcion: editingReparacion.descripcion,
          fechaIngreso: editingReparacion.fechaIngreso.split('T')[0],
          fechaSalida: editingReparacion.fechaSalida?.split('T')[0] || '',
          estado: editingReparacion.estado,
          costo: editingReparacion.costo || '',
          equipoId: editingReparacion.equipoId,
        }
      : {
          estado: 'PENDIENTE',
          fechaIngreso: new Date().toISOString().split('T')[0],
        },
  });

  const onSubmit = async (data: ReparacionFormData) => {
    try {
      const payload = {
        ...data,
        costo: data.costo === '' ? undefined : Number(data.costo),
        fechaSalida: data.fechaSalida === '' ? undefined : data.fechaSalida,
      };

      if (editingReparacion) {
        await updateMutation.mutateAsync({
          id: editingReparacion.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload as ReparacionCreate);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar reparación:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReparacion(null);
    reset();
  };

  const handleEdit = (reparacion: Reparacion) => {
    setEditingReparacion(reparacion);
    setIsModalOpen(true);
    reset({
      descripcion: reparacion.descripcion,
      fechaIngreso: reparacion.fechaIngreso.split('T')[0],
      fechaSalida: reparacion.fechaSalida?.split('T')[0] || '',
      estado: reparacion.estado,
      costo: reparacion.costo || '',
      equipoId: reparacion.equipoId,
    });
  };

  const handleDelete = async (reparacion: Reparacion) => {
    if (window.confirm(`¿Estás seguro de eliminar esta reparación?`)) {
      try {
        await deleteMutation.mutateAsync(reparacion.id);
      } catch (error) {
        console.error('Error al eliminar reparación:', error);
      }
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Descripción', accessor: 'descripcion' as const },
    {
      header: 'Fecha Ingreso',
      accessor: (row: Reparacion) => new Date(row.fechaIngreso).toLocaleDateString(),
    },
    {
      header: 'Fecha Salida',
      accessor: (row: Reparacion) =>
        row.fechaSalida ? new Date(row.fechaSalida).toLocaleDateString() : '-',
    },
    {
      header: 'Estado',
      accessor: (row: Reparacion) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[row.estado]}`}>
          {row.estado.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Costo',
      accessor: (row: Reparacion) => (row.costo ? `$${row.costo.toFixed(2)}` : '-'),
    },
    {
      header: 'Equipo',
      accessor: (row: Reparacion) =>
        row.equipo ? `${row.equipo.marca} ${row.equipo.modelo}` : '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reparaciones</h1>
            <p className="text-gray-600 mt-1">Gestiona las reparaciones de equipos</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Reparación
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DataTable
            data={reparaciones}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay reparaciones registradas"
          />
        </div>

        {/* Modal para crear/editar */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingReparacion ? 'Editar Reparación' : 'Nueva Reparación'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Equipo" error={errors.equipoId?.message} required htmlFor="equipoId">
              <select
                id="equipoId"
                {...register('equipoId', { valueAsNumber: true })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.equipoId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione un equipo</option>
                {equipos.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.marca} {equipo.modelo} - {equipo.cliente?.nombre} {equipo.cliente?.apellido}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Descripción" error={errors.descripcion?.message} required htmlFor="descripcion">
              <textarea
                id="descripcion"
                rows={3}
                {...register('descripcion')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.descripcion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe el problema o trabajo a realizar"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Fecha Ingreso" error={errors.fechaIngreso?.message} required htmlFor="fechaIngreso">
                <input
                  id="fechaIngreso"
                  type="date"
                  {...register('fechaIngreso')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.fechaIngreso ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>

              <FormField label="Fecha Salida" error={errors.fechaSalida?.message} htmlFor="fechaSalida">
                <input
                  id="fechaSalida"
                  type="date"
                  {...register('fechaSalida')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.fechaSalida ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Estado" error={errors.estado?.message} required htmlFor="estado">
                <select
                  id="estado"
                  {...register('estado')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.estado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="COMPLETADA">Completada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </FormField>

              <FormField label="Costo" error={errors.costo?.message} htmlFor="costo">
                <input
                  id="costo"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('costo', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.costo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </FormField>
            </div>

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
                  : editingReparacion
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
