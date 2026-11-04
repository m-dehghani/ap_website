import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useThemePreference } from '@/hooks/useThemePreference';

describe('useThemePreference', () => {
  const mediaQuery = {
    matches: false,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(
      (
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) => mediaQueryListeners.set(type, listener),
    ),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;
  const mediaQueryListeners = new Map<
    string,
    EventListenerOrEventListenerObject
  >();

  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    document.head.innerHTML =
      '<meta name="color-scheme" content="light dark"><meta name="theme-color" content="#f8fafc">';
    mediaQuery.matches = false;
    mediaQueryListeners.clear();
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
  });

  it('persists and applies a selected theme preference', () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => result.current.setThemePreference('dark'));

    expect(localStorage.getItem('ap-theme-preference')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    ).toBe('#160f12');
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
    ).toBe('dark');
    expect(result.current.preference).toBe('dark');
  });

  it('uses the system color preference when no override is saved', () => {
    mediaQuery.matches = true;

    renderHook(() => useThemePreference());

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    ).toBe('#160f12');
    expect(
      document.querySelector('meta[name="color-scheme"]')?.getAttribute('content'),
    ).toBe('light dark');
  });

  it('updates the applied theme when the system preference changes', () => {
    renderHook(() => useThemePreference());

    mediaQuery.matches = true;
    const listener = mediaQueryListeners.get('change');
    if (typeof listener === 'function') listener(new Event('change'));
    else listener?.handleEvent(new Event('change'));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('keeps an explicit theme when the system preference changes', () => {
    localStorage.setItem('ap-theme-preference', 'light');
    renderHook(() => useThemePreference());

    mediaQuery.matches = true;
    const listener = mediaQueryListeners.get('change');
    if (typeof listener === 'function') listener(new Event('change'));
    else listener?.handleEvent(new Event('change'));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    ).toBe('#f8fafc');
  });
});
