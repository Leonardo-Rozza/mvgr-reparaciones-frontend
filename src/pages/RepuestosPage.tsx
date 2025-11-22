import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { useRepuestosQuery } from '../api/queries/repuestos.queries';
import {
  useCreateRepuestoMutation,
  useUpdateRepuestoMutation,
  useDeleteRepuestoMutation,
} from '../api/mutations/repuestos.mutations';
import type { Repuesto, RepuestoCreate } from '../types';

// Schema de validación
const repuestoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  categoria: z.string().optional(),
});

type RepuestoFormData = z.infer<typeof repuestoSchema>;

export const RepuestosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState<Repuesto | null>(null);

  const { data: repuestos = [], isLoading } = useRepuestosQuery();
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
          descripcion: editingRepuesto.descripcion,
          precio: editingRepuesto.precio,
          stock: editingRepuesto.stock,
          categoria: editingRepuesto.categoria,
        }
      : undefined,
  });

  const onSubmit = async (data: RepuestoFormData) => {
    try {
      if (editingRepuesto) {
        await updateMutation.mutateAsync({
          id: editingRepuesto.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data as RepuestoCreate);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar repuesto:', error);
    }
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
      descripcion: repuesto.descripcion,
      precio: repuesto.precio,
      stock: repuesto.stock,
      categoria: repuesto.categoria,
    });
  };

  const handleDelete = async (repuesto: Repuesto) => {
    if (window.confirm(`¿Estás seguro de eliminar el repuesto ${repuesto.nombre}?`)) {
      try {
        await deleteMutation.mutateAsync(repuesto.id);
      } catch (error) {
        console.error('Error al eliminar repuesto:', error);
      }
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
      header: 'Stock',
      accessor: (row: Repuesto) => (
        <span className={row.stock < 10 ? 'text-red-600 font-semibold' : ''}>
          {row.stock}
        </span>
      ),
    },
    {
      header: 'Categoría',
      accessor: (row: Repuesto) => row.categoria || '-',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repuestos</h1>
            <p className="text-gray-600 mt-1">Gestiona el inventario de repuestos</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Repuesto
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <DataTable
            data={repuestos}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            emptyMessage="No hay repuestos registrados"
          />
        </div>

        {/* Modal para crear/editar */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingRepuesto ? 'Editar Repuesto' : 'Nuevo Repuesto'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField label="Descripción" error={errors.descripcion?.message} htmlFor="descripcion">
              <textarea
                id="descripcion"
                rows={3}
                {...register('descripcion')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.descripcion ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Precio" error={errors.precio?.message} required htmlFor="precio">
                <input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('precio', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.precio ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </FormField>

              <FormField label="Stock" error={errors.stock?.message} required htmlFor="stock">
                <input
                  id="stock"
                  type="number"
                  min="0"
                  {...register('stock', { valueAsNumber: true })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
              </FormField>
            </div>

            <FormField label="Categoría" error={errors.categoria?.message} htmlFor="categoria">
              <input
                id="categoria"
                type="text"
                {...register('categoria')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  errors.categoria ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Pantalla, Batería, Cargador"
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
