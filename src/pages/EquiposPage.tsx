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

const equipoSchema = z.object({
  marca: z.string().min(1, 'La marca es requerida').max(60, 'Máximo 60 caracteres'),
  modelo: z.string().min(1, 'El modelo es requerido').max(60, 'Máximo 60 caracteres'),
  imei: z.string().max(30, 'Máximo 30 caracteres').optional().or(z.literal('')),
  color: z.string().max(40, 'Máximo 40 caracteres').optional().or(z.literal('')),
  descripcion: z.string().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  clienteId: z.number().min(1, 'Debe seleccionar un cliente'),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

const inputClasses = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:text-gray-100 ${
    hasError ? 'border-red-300 dark:border-red-400' : 'border-gray-300 dark:border-gray-700 dark:bg-gray-900'
  }`;

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
          marca: editingEquipo.marca,
          modelo: editingEquipo.modelo,
          imei: editingEquipo.imei || '',
          color: editingEquipo.color || '',
          descripcion: editingEquipo.descripcion || '',
          clienteId: editingEquipo.clienteId,
        }
      : undefined,
  });

  const onSubmit = async (data: EquipoFormData) => {
    const payload: EquipoCreate = {
      marca: data.marca,
      modelo: data.modelo,
      clienteId: data.clienteId,
      imei: data.imei && data.imei.trim() !== '' ? data.imei : undefined,
      color: data.color && data.color.trim() !== '' ? data.color : undefined,
      descripcion: data.descripcion && data.descripcion.trim() !== '' ? data.descripcion : undefined,
    };

    if (editingEquipo) {
      await updateMutation.mutateAsync({
        id: editingEquipo.id,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    handleCloseModal();
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
      marca: equipo.marca,
      modelo: equipo.modelo,
      imei: equipo.imei || '',
      color: equipo.color || '',
      descripcion: equipo.descripcion || '',
      clienteId: equipo.clienteId,
    });
  };

  const handleDelete = async (equipo: Equipo) => {
    if (window.confirm(`¿Estás seguro de eliminar el equipo ${equipo.marca} ${equipo.modelo}?`)) {
      await deleteMutation.mutateAsync(equipo.id);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id' as const },
    { header: 'Marca', accessor: 'marca' as const },
    { header: 'Modelo', accessor: 'modelo' as const },
    {
      header: 'IMEI',
      accessor: (row: Equipo) => row.imei || '-',
    },
    {
      header: 'Color',
      accessor: (row: Equipo) => row.color || '-',
    },
    {
      header: 'Cliente',
      accessor: (row: Equipo) => {
        const cliente = clientes.find((c) => c.id === row.clienteId);
        return cliente ? `${cliente.nombre} ${cliente.apellido}` : '-';
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Equipos</h1>
            <p className="text-gray-600 dark:text-gray-400">Gestiona los equipos de los clientes</p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-indigo-700 sm:w-auto"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Equipo
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <DataTable
            data={equipos}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay equipos registrados"
          />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Marca" error={errors.marca?.message} required htmlFor="marca">
                <input id="marca" type="text" maxLength={60} {...register('marca')} className={inputClasses(!!errors.marca)} />
              </FormField>
              <FormField label="Modelo" error={errors.modelo?.message} required htmlFor="modelo">
                <input id="modelo" type="text" maxLength={60} {...register('modelo')} className={inputClasses(!!errors.modelo)} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="IMEI" error={errors.imei?.message} htmlFor="imei">
                <input id="imei" type="text" maxLength={30} {...register('imei')} className={inputClasses(!!errors.imei)} />
              </FormField>
              <FormField label="Color" error={errors.color?.message} htmlFor="color">
                <input id="color" type="text" maxLength={40} {...register('color')} className={inputClasses(!!errors.color)} />
              </FormField>
            </div>

            <FormField label="Descripción" error={errors.descripcion?.message} htmlFor="descripcion">
              <textarea
                id="descripcion"
                rows={3}
                maxLength={255}
                {...register('descripcion')}
                className={`${inputClasses(!!errors.descripcion)} resize-none`}
                placeholder="Descripción adicional del equipo"
              />
            </FormField>

            <FormField label="Cliente" error={errors.clienteId?.message} required htmlFor="clienteId">
              <select id="clienteId" {...register('clienteId', { valueAsNumber: true })} className={inputClasses(!!errors.clienteId)}>
                <option value="">Seleccione un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre} {cliente.apellido}
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
