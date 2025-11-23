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
import type { Reparacion, ReparacionCreate, ReparacionUpdate } from '../types';

const reparacionSchema = z.object({
  descripcionProblema: z.string().min(1, 'La descripción del problema es requerida'),
  fechaIngreso: z.string().optional().or(z.literal('')),
  fechaEntrega: z.string().optional().or(z.literal('')),
  estado: z.enum(['INGRESADO', 'EN_PROCESO', 'ESPERANDO_REPUESTO', 'COMPLETADO', 'ENTREGADO']).optional(),
  precioFinal: z.number().min(0).optional().or(z.literal('')),
  equipoId: z.number().min(1, 'Debe seleccionar un equipo'),
});

type ReparacionFormData = z.infer<typeof reparacionSchema>;

const inputClasses = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:text-gray-100 ${
    hasError ? 'border-red-300 dark:border-red-400' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-900'
  }`;

const estadoColors: Record<
  NonNullable<Reparacion['estado']>,
  string
> = {
  INGRESADO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-300/20 dark:text-yellow-100',
  EN_PROCESO: 'bg-blue-100 text-blue-800 dark:bg-blue-300/20 dark:text-blue-100',
  ESPERANDO_REPUESTO: 'bg-orange-100 text-orange-800 dark:bg-orange-300/20 dark:text-orange-100',
  COMPLETADO: 'bg-green-100 text-green-800 dark:bg-green-300/20 dark:text-green-100',
  ENTREGADO: 'bg-purple-100 text-purple-800 dark:bg-purple-300/20 dark:text-purple-100',
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
          fechaEntrega: editingReparacion.fechaEntrega?.split('T')[0] || '',
          estado: editingReparacion.estado,
          precioFinal: editingReparacion.precioFinal || '',
          equipoId: editingReparacion.equipoId,
        }
      : {
          estado: 'INGRESADO',
          fechaIngreso: new Date().toISOString().split('T')[0],
        },
  });

  const getEquipoLabel = (reparacion: Reparacion) => {
    if (reparacion.equipo) {
      return `${reparacion.equipo.marca} ${reparacion.equipo.modelo}`;
    }
    const equipo = equipos.find((item) => item.id === reparacion.equipoId);
    return equipo ? `${equipo.marca} ${equipo.modelo}` : '-';
  };

  const onSubmit = async (data: ReparacionFormData) => {
    const estadoValue = data.estado ?? editingReparacion?.estado ?? 'INGRESADO';
    const basePayload = {
      descripcionProblema: data.descripcionProblema,
      equipoId: data.equipoId,
      fechaIngreso: data.fechaIngreso && data.fechaIngreso !== '' ? data.fechaIngreso : undefined,
      fechaEntrega: data.fechaEntrega && data.fechaEntrega !== '' ? data.fechaEntrega : undefined,
      estado: estadoValue,
      precioFinal: data.precioFinal !== '' ? Number(data.precioFinal) : undefined,
    };

    const cleanPayload = Object.fromEntries(Object.entries(basePayload).filter(([, value]) => value !== undefined)) as Partial<ReparacionCreate>;

    if (editingReparacion) {
      const updatePayload: ReparacionUpdate = {
        id: editingReparacion.id,
        ...cleanPayload,
      };
      await updateMutation.mutateAsync(updatePayload);
    } else {
      await createMutation.mutateAsync(cleanPayload as ReparacionCreate);
    }
    handleCloseModal();
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
      fechaEntrega: reparacion.fechaEntrega?.split('T')[0] || '',
      estado: reparacion.estado,
      precioFinal: reparacion.precioFinal || '',
      equipoId: reparacion.equipoId,
    });
  };

  const handleDelete = async (reparacion: Reparacion) => {
    if (window.confirm('¿Estás seguro de eliminar esta reparación?')) {
      await deleteMutation.mutateAsync(reparacion.id);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Descripción Problema', accessor: 'descripcionProblema' as const },
    {
      header: 'Fecha Ingreso',
      accessor: (row: Reparacion) => {
        if (!row.fechaIngreso) return '-';
        const date = new Date(row.fechaIngreso);
        return Number.isNaN(date.getTime())
          ? row.fechaIngreso
          : date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      },
    },
    {
      header: 'Fecha Entrega',
      accessor: (row: Reparacion) => {
        if (!row.fechaEntrega) return '-';
        const date = new Date(row.fechaEntrega);
        return Number.isNaN(date.getTime())
          ? row.fechaEntrega
          : date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      },
    },
    {
      header: 'Estado',
      accessor: (row: Reparacion) =>
        row.estado ? (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${estadoColors[row.estado]}`}>
            {row.estado.replace('_', ' ')}
          </span>
        ) : (
          '-'
        ),
    },
    {
      header: 'Precio',
      accessor: (row: Reparacion) => (row.precioFinal ? `$${row.precioFinal.toFixed(2)}` : '-'),
    },
    {
      header: 'Equipo',
      accessor: (row: Reparacion) => getEquipoLabel(row),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reparaciones</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona las reparaciones de equipos</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-indigo-700 sm:w-auto"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Reparación
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <DataTable
            data={reparaciones}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay reparaciones registradas"
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingReparacion ? 'Editar Reparación' : 'Nueva Reparación'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Equipo" error={errors.equipoId?.message} required htmlFor="equipoId">
              <select id="equipoId" {...register('equipoId', { valueAsNumber: true })} className={inputClasses(!!errors.equipoId)}>
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
                className={`${inputClasses(!!errors.descripcionProblema)} resize-none`}
                placeholder="Describe el problema o trabajo a realizar"
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Fecha Ingreso" error={errors.fechaIngreso?.message} htmlFor="fechaIngreso">
                <input id="fechaIngreso" type="date" {...register('fechaIngreso')} className={inputClasses(!!errors.fechaIngreso)} />
              </FormField>
              <FormField label="Fecha Entrega" error={errors.fechaEntrega?.message} htmlFor="fechaEntrega">
                <input id="fechaEntrega" type="date" {...register('fechaEntrega')} className={inputClasses(!!errors.fechaEntrega)} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Estado" error={errors.estado?.message} htmlFor="estado">
                <select id="estado" {...register('estado')} className={inputClasses(!!errors.estado)}>
                  <option value="">Seleccione un estado</option>
                  <option value="INGRESADO">Ingresado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="ESPERANDO_REPUESTO">Esperando Repuesto</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="ENTREGADO">Entregado</option>
                </select>
              </FormField>

              <FormField label="Precio" error={errors.precioFinal?.message} htmlFor="precioFinal">
                <input
                  id="precioFinal"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('precioFinal', { valueAsNumber: true })}
                  className={inputClasses(!!errors.precioFinal)}
                  placeholder="0.00"
                />
              </FormField>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
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
