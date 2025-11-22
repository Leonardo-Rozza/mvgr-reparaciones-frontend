import { useNavigate } from 'react-router';
import { useAuth } from '../store/auth.store';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 z-30 h-16 bg-white border-b border-gray-200">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Breadcrumb o título de página */}
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Panel de Control
          </h2>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-4">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
              {user?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-800">{user || 'Usuario'}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            title="Cerrar sesión"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

