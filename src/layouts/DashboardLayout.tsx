import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      
      {/* Main content */}
      <main className="lg:ml-64 mt-16 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
};

