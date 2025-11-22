import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: (token: string, username: string) => {
        set({
          token,
          user: username,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage', // nombre para localStorage
    }
  )
);

// Selector para obtener el estado de autenticación
export const useAuth = () => {
  const { token, user, login, logout, isAuthenticated } = authStore();
  return { token, user, login, logout, isAuthenticated };
};

