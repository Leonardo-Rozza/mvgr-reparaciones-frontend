import { DashboardLayout } from '../layouts/DashboardLayout';
import type { ReactElement } from 'react';
import { useClientesQuery } from '../api/queries/clientes.queries';
import { useEquiposQuery } from '../api/queries/equipos.queries';
import { useReparacionesQuery } from '../api/queries/reparaciones.queries';
import { useRepuestosQuery } from '../api/queries/repuestos.queries';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactElement;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard = ({ title, value, icon, color, trend }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} rounded-xl p-3 text-white shadow`}>{icon}</div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { data: clientes = [] } = useClientesQuery();
  const { data: equipos = [] } = useEquiposQuery();
  const { data: reparaciones = [] } = useReparacionesQuery();
  const { data: repuestos = [] } = useRepuestosQuery();

  const stats = {
    clientes: clientes.length,
    equipos: equipos.length,
    reparaciones: reparaciones.filter((r) => r.estado && r.estado !== 'COMPLETADO' && r.estado !== 'ENTREGADO').length,
    repuestos: repuestos.length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Resumen general del sistema de reparaciones</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Clientes"
            value={stats.clientes}
            color="blue"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Equipos"
            value={stats.equipos}
            color="green"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            }
          />
          <StatCard
            title="Reparaciones activas"
            value={stats.reparaciones}
            color="yellow"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            title="Repuestos en stock"
            value={stats.repuestos}
            color="purple"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Reparaciones recientes</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <p>No hay reparaciones recientes</p>
                <p className="mt-2 text-sm">Las reparaciones aparecerán aquí</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { href: '/clientes', label: 'Nuevo Cliente' },
                { href: '/equipos', label: 'Nuevo Equipo' },
                { href: '/reparaciones', label: 'Nueva Reparación' },
                { href: '/repuestos', label: 'Nuevo Repuesto' },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-4 text-center text-sm font-medium text-gray-700 transition hover:-translate-y-0.5 hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-800 dark:text-gray-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                >
                  <svg className="mb-2 h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
