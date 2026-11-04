import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContactPage from '@/pages/contact';

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/PageHero', () => ({
  default: () => null,
}));

describe('ContactPage validation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('announces server field errors and focuses the first invalid field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'اطلاعات واردشده را بررسی کنید.',
          fieldErrors: { email: ['ایمیل نامعتبر است.'] },
        }),
      }),
    );

    const { container } = render(<ContactPage />);
    fireEvent.submit(container.querySelector('form')!);

    const email = screen.getByLabelText('ایمیل');
    await waitFor(() => {
      expect(email).toHaveFocus();
      expect(email).toHaveAttribute('aria-invalid', 'true');
      expect(email).toHaveAttribute('aria-describedby', 'email-error');
      expect(screen.getByText('ایمیل نامعتبر است.')).toBeInTheDocument();
    });
  });
});
