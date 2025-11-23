import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useRepuestosQuery } from '../api/queries/repuestos.queries';
import { useReparacionesQuery } from '../api/queries/reparaciones.queries';
import {
  useCreateRepuestoMutation,
  useUpdateRepuestoMutation,
  useDeleteRepuestoMutation,
} from '../api/mutations/repuestos.mutations';
import type { Repuesto, RepuestoCreate } from '../types';

const repuestoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional().or(z.literal('')),
  precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  reparacionId: z.union([z.number().int().min(1), z.literal('')]).optional(),
});

type RepuestoFormData = z.infer<typeof repuestoSchema>;

const inputClasses = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:text-gray-100 ${
    hasError ? 'border-red-300 dark:border-red-400' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-900'
  }`;

export const RepuestosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);

  const { data: repuestos = [], isLoading } = useRepuestosQuery();
  const { data: reparaciones = [] } = useReparacionesQuery();
  const createMutation = useCreateRepuestoMutation();
  const updateMutation = useUpdateRepuestoMutation();
  const deleteMutation = useDeleteRepuestoMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RepuestoFormData>({
    resolver: zodResolver(repuestoSchema),
    defaultValues: editingRepuesto
      ? {
          nombre: editingRepuesto.nombre,
          descripcion: editingRepuesto.descripcion || '',
          precio: editingRepuesto.precio,
          reparacionId: editingRepuesto.reparacionId || '',
        }
      : undefined,
  });

  const onSubmit = async (data: RepuestoFormData) => {
    const payload: RepuestoCreate = {
      nombre: data.nombre,
      precio: data.precio,
      descripcion: data.descripcion && data.descripcion.trim() !== '' ? data.descripcion : undefined,
      reparacionId:
        data.reparacionId !== undefined && data.reparacionId !== ''
          ? typeof data.reparacionId === 'number'
            ? data.reparacionId
            : Number(data.reparacionId)
          : undefined,
    };

    if (editingRepuesto) {
      await updateMutation.mutateAsync({
        id: editingRepuesto.id,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRepuesto(null);
    reset();
  };

  const handleEdit = (repuesto: Repuesto) => {
    setEditingRepuesto(repuesto);
    setIsModalOpen(true);
    reset({
      nombre: repuesto.nombre,
      descripcion: repuesto.descripcion || '',
      precio: repuesto.precio,
      reparacionId: repuesto.reparacionId || '',
    });
  };

  const handleDelete = async (repuesto: Repuesto) => {
    if (window.confirm(`¿Estás seguro de eliminar el repuesto ${repuesto.nombre}?`)) {
      await deleteMutation.mutateAsync(repuesto.id);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Nombre', accessor: 'nombre' as const },
    {
      header: 'Descripción',
      accessor: (row: Repuesto) => row.descripcion || '-',
    },
    {
      header: 'Precio',
      accessor: (row: Repuesto) => `$${row.precio.toFixed(2)}`,
    },
    {
      header: 'Reparación ID',
      accessor: (row: Repuesto) => row.reparacionId || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Repuestos</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona el inventario de repuestos</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-indigo-700 sm:w-auto"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Repuesto
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <DataTable
            data={repuestos}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay repuestos registrados"
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingRepuesto ? 'Editar Repuesto' : 'Nuevo Repuesto'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Nombre" error={errors.nombre?.message} required htmlFor="nombre">
              <input id="nombre" type="text" {...register('nombre')} className={inputClasses(!!errors.nombre)} />
            </FormField>

            <FormField label="Descripción" error={errors.descripcion?.message} htmlFor="descripcion">
              <textarea
                id="descripcion"
                rows={3}
                {...register('descripcion')}
                className={`${inputClasses(!!errors.descripcion)} resize-none`}
                placeholder="Detalle opcional del repuesto"
              />
            </FormField>

            <FormField label="Precio" error={errors.precio?.message} required htmlFor="precio">
              <input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                {...register('precio', { valueAsNumber: true })}
                className={inputClasses(!!errors.precio)}
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Reparación asociada" error={errors.reparacionId?.message} htmlFor="reparacionId">
              <select
                id="reparacionId"
                {...register('reparacionId', { valueAsNumber: true })}
                className={inputClasses(!!errors.reparacionId)}
              >
                <option value="">Sin reparación asociada</option>
                {reparaciones.map((reparacion) => (
                  <option key={reparacion.id} value={reparacion.id}>
                    Reparación #{reparacion.id} - {reparacion.descripcionProblema.substring(0, 30)}
                    {reparacion.descripcionProblema.length > 30 ? '…' : ''}
                  </option>
                ))}
              </select>
            </FormField>

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
                  : editingRepuesto
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
