import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useThemePreference } from '@/hooks/useThemePreference';

describe('useThemePreference', () => {
  const mediaQuery = {
    matches: false,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;

  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.head.innerHTML = '<meta name="color-scheme" content="light dark">';
    mediaQuery.matches = false;
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
  });

  it('persists and applies a selected theme preference', () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => result.current.setThemePreference('dark'));

    expect(localStorage.getItem('ap-theme-preference')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
    ).toBe('dark');
    expect(result.current.preference).toBe('dark');
  });

  it('uses the system color preference when no override is saved', () => {
    mediaQuery.matches = true;

    renderHook(() => useThemePreference());

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
    ).toBe('light dark');
  });
});
