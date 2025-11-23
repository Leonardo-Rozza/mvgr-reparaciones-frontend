import { useEffect } from 'react';
import { hasStoredThemePreference, syncThemeClass, useThemeStore } from '../store/theme.store';

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      if (!hasStoredThemePreference()) {
        setTheme(event.matches ? 'dark' : 'light', { persist: false });
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [setTheme]);

  useEffect(() => {
    syncThemeClass(theme);
  }, [theme]);

  return { theme, setTheme, toggleTheme };
};
