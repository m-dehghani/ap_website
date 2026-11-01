import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

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
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
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

export function useThemeSelection() {
  const { user, loading } = useAuth();
  const { preference, setThemePreference } = useThemePreference();
  const [saving, setSaving] = useState(false);

  const selectThemePreference = useCallback(
    async (nextPreference: ThemePreference) => {
      setThemePreference(nextPreference);
      if (!user || loading) return;

      setSaving(true);
      try {
        const response = await fetch('/api/preferences/theme', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themePreference: nextPreference }),
        });
        if (!response.ok) {
          throw new Error(`Theme preference request failed (${response.status})`);
        }
      } catch (error) {
        console.error('Theme preference save failed:', error);
        toast.error('پوسته در این مرورگر اعمال شد، اما ذخیره آن برای حساب ناموفق بود.');
      } finally {
        setSaving(false);
      }
    },
    [loading, setThemePreference, user],
  );

  return {
    preference,
    selectThemePreference,
    saving: saving || loading,
  };
}
