import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ap-theme-preference';

function getStoredPreference(): ThemePreference {
  const preference = window.localStorage.getItem(STORAGE_KEY);
  return preference === 'light' || preference === 'dark' ? preference : 'system';
}

function applyTheme(preference: ThemePreference) {
  const isDark =
    preference === 'dark' ||
    (preference === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  document
    .querySelector<HTMLMetaElement>('meta[name="color-scheme"]')
    ?.setAttribute('content', preference === 'system' ? 'light dark' : preference);
}

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const syncPreference = () => {
      const storedPreference = getStoredPreference();
      setPreference(storedPreference);
      applyTheme(storedPreference);
    };

    syncPreference();

    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      if (getStoredPreference() === 'system') applyTheme('system');
    };

    window.addEventListener('storage', syncPreference);
    window.addEventListener('ap-theme-change', syncPreference);
    colorScheme.addEventListener('change', updateSystemTheme);

    return () => {
      window.removeEventListener('storage', syncPreference);
      window.removeEventListener('ap-theme-change', syncPreference);
      colorScheme.removeEventListener('change', updateSystemTheme);
    };
  }, []);

  const setThemePreference = useCallback((nextPreference: ThemePreference) => {
    window.localStorage.setItem(STORAGE_KEY, nextPreference);
    setPreference(nextPreference);
    applyTheme(nextPreference);
    window.dispatchEvent(new Event('ap-theme-change'));
  }, []);

  return { preference, setThemePreference };
}
