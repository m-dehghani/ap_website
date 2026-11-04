import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import RegisterPage from '@/pages/register';

vi.mock('next/router', () => ({
  useRouter: () => ({ query: {}, push: vi.fn() }),
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('registration stepper', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the user on the personal step and reports missing required fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      }),
    );

    render(<RegisterPage />);

    expect(screen.getByRole('navigation', { name: 'مراحل ثبت‌نام' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'اطلاعات شخصی' })).toBeVisible();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'مرحله بعد' }));
    });

    await waitFor(() => {
      expect(screen.getByText('نام باید حداقل ۲ کاراکتر باشد')).toBeVisible();
    });
    expect(screen.getByRole('heading', { name: 'اطلاعات شخصی' })).toBeVisible();
    expect(screen.getAllByRole('listitem')[0]).toHaveAttribute(
      'aria-current',
      'step',
    );
  });
});
