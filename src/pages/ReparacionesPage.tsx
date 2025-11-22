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
  descripcionProblema: z.string().min(1, 'La descripción del problema es requerida'),
  fechaIngreso: z.string().optional().or(z.literal('')),
  fechaEstimadaEntrega: z.string().optional().or(z.literal('')),
  fechaEntrega: z.string().optional().or(z.literal('')),
  estado: z.enum(['INGRESADO', 'EN_PROCESO', 'ESPERANDO_REPUESTO', 'COMPLETADO', 'ENTREGADO']).optional(),
  precioEstimado: z.number().min(0).optional().or(z.literal('')),
  precioFinal: z.number().min(0).optional().or(z.literal('')),
  equipoId: z.number().min(1, 'Debe seleccionar un equipo'),
});

type ReparacionFormData = z.infer<typeof reparacionSchema>;

const estadoColors = {
  INGRESADO: 'bg-yellow-100 text-yellow-800',
  EN_PROCESO: 'bg-blue-100 text-blue-800',
  ESPERANDO_REPUESTO: 'bg-orange-100 text-orange-800',
  COMPLETADO: 'bg-green-100 text-green-800',
  ENTREGADO: 'bg-purple-100 text-purple-800',
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
          descripcionProblema: editingReparacion.descripcionProblema,
          fechaIngreso: editingReparacion.fechaIngreso?.split('T')[0] || '',
          fechaEstimadaEntrega: editingReparacion.fechaEstimadaEntrega?.split('T')[0] || '',
          fechaEntrega: editingReparacion.fechaEntrega?.split('T')[0] || '',
          estado: editingReparacion.estado,
          precioEstimado: editingReparacion.precioEstimado || '',
          precioFinal: editingReparacion.precioFinal || '',
          equipoId: editingReparacion.equipoId,
        }
      : {
          estado: 'INGRESADO',
          fechaIngreso: new Date().toISOString().split('T')[0],
        },
  });

  const onSubmit = async (data: ReparacionFormData) => {
    try {
      // Limpiar campos opcionales vacíos y convertir a formato del backend
      const payload: ReparacionCreate = {
        descripcionProblema: data.descripcionProblema,
        equipoId: data.equipoId,
        fechaIngreso: data.fechaIngreso && data.fechaIngreso !== '' ? data.fechaIngreso : undefined,
        fechaEstimadaEntrega: data.fechaEstimadaEntrega && data.fechaEstimadaEntrega !== '' ? data.fechaEstimadaEntrega : undefined,
        fechaEntrega: data.fechaEntrega && data.fechaEntrega !== '' ? data.fechaEntrega : undefined,
        estado: data.estado,
        precioEstimado: data.precioEstimado !== '' ? Number(data.precioEstimado) : undefined,
        precioFinal: data.precioFinal !== '' ? Number(data.precioFinal) : undefined,
      };

      console.log('Payload a enviar:', payload);

      if (editingReparacion) {
        await updateMutation.mutateAsync({
          id: editingReparacion.id,
          ...payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
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
      descripcionProblema: reparacion.descripcionProblema,
      fechaIngreso: reparacion.fechaIngreso?.split('T')[0] || '',
      fechaEstimadaEntrega: reparacion.fechaEstimadaEntrega?.split('T')[0] || '',
      fechaEntrega: reparacion.fechaEntrega?.split('T')[0] || '',
      estado: reparacion.estado,
      precioEstimado: reparacion.precioEstimado || '',
      precioFinal: reparacion.precioFinal || '',
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
    { header: 'Descripción Problema', accessor: 'descripcionProblema' as const },
    {
      header: 'Fecha Ingreso',
      accessor: (row: Reparacion) => row.fechaIngreso ? new Date(row.fechaIngreso).toLocaleDateString() : '-',
    },
    {
      header: 'Fecha Est. Entrega',
      accessor: (row: Reparacion) =>
        row.fechaEstimadaEntrega ? new Date(row.fechaEstimadaEntrega).toLocaleDateString() : '-',
    },
    {
      header: 'Fecha Entrega',
      accessor: (row: Reparacion) =>
        row.fechaEntrega ? new Date(row.fechaEntrega).toLocaleDateString() : '-',
    },
    {
      header: 'Estado',
      accessor: (row: Reparacion) => row.estado ? (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColors[row.estado]}`}>
          {row.estado.replace('_', ' ')}
        </span>
      ) : '-',
    },
    {
      header: 'Precio Est.',
      accessor: (row: Reparacion) => (row.precioEstimado ? `$${row.precioEstimado.toFixed(2)}` : '-'),
    },
    {
      header: 'Precio Final',
      accessor: (row: Reparacion) => (row.precioFinal ? `$${row.precioFinal.toFixed(2)}` : '-'),
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

            <FormField label="Descripción del Problema" error={errors.descripcionProblema?.message} required htmlFor="descripcionProblema">
              <textarea
                id="descripcionProblema"
                rows={3}
                {...register('descripcionProblema')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.descripcionProblema ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe el problema o trabajo a realizar"
              />
            </FormField>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Fecha Ingreso" error={errors.fechaIngreso?.message} htmlFor="fechaIngreso">
                <input
                  id="fechaIngreso"
                  type="date"
                  {...register('fechaIngreso')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.fechaIngreso ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>

              <FormField label="Fecha Est. Entrega" error={errors.fechaEstimadaEntrega?.message} htmlFor="fechaEstimadaEntrega">
                <input
                  id="fechaEstimadaEntrega"
                  type="date"
                  {...register('fechaEstimadaEntrega')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.fechaEstimadaEntrega ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>

              <FormField label="Fecha Entrega" error={errors.fechaEntrega?.message} htmlFor="fechaEntrega">
                <input
                  id="fechaEntrega"
                  type="date"
                  {...register('fechaEntrega')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.fechaEntrega ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField label="Estado" error={errors.estado?.message} htmlFor="estado">
                <select
                  id="estado"
                  {...register('estado')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.estado ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccione un estado</option>
                  <option value="INGRESADO">Ingresado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="ESPERANDO_REPUESTO">Esperando Repuesto</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="ENTREGADO">Entregado</option>
                </select>
              </FormField>

              <FormField label="Precio Estimado" error={errors.precioEstimado?.message} htmlFor="precioEstimado">
                <input
                  id="precioEstimado"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('precioEstimado', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.precioEstimado ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Precio Final" error={errors.precioFinal?.message} htmlFor="precioFinal">
                <input
                  id="precioFinal"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('precioFinal', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.precioFinal ? 'border-red-300' : 'border-gray-300'
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
