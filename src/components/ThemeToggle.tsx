import type { ComponentProps } from 'react';
import { useTheme } from '../hooks/useTheme';

type ButtonProps = ComponentProps<'button'>;

export const ThemeToggle = (props: Omit<ButtonProps, 'onClick' | 'children'>) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { className = '', ...rest } = props;

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      {...rest}
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
        isDark
          ? 'border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700'
          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          isDark ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        {isDark ? (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707 8 8 0 1017.293 13.293z" />
          </svg>
        ) : (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.95-2.536a1 1 0 010 1.414L3.05 14.879a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414 0zM5 10a1 1 0 01-1-1H3a1 1 0 110-2h1a1 1 0 112 0v1a1 1 0 01-1 1zm3.95-5.464a1 1 0 010-1.414l2-2a1 1 0 111.414 1.414l-2 2A1 1 0 018.95 4.536zM15 9a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zm-.05 3.464a1 1 0 010-1.414l2-2a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0zM10 5a1 1 0 01-1-1V3a1 1 0 112 0v1a1 1 0 01-1 1zm0 5a3 3 0 100-6 3 3 0 000 6zm1 5a1 1 0 10-2 0 1 1 0 002 0z" />
          </svg>
        )}
      </span>
      <span className="hidden sm:inline">{isDark ? 'Oscuro' : 'Claro'}</span>
    </button>
  );
};
