import { fireEvent, renderWithProviders, screen } from '@/test-utils';
import ContactPage from '@/pages/contact';

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('contact form', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('provides labelled contact fields and an unobtrusive honeypot', () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByLabelText('نام')).toBeInTheDocument();
    expect(screen.getByLabelText('نام خانوادگی')).toBeInTheDocument();
    expect(screen.getByLabelText('ایمیل')).toBeInTheDocument();
    expect(screen.getByLabelText('پیام')).toBeInTheDocument();
    expect(document.querySelector('[name="company"]')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('posts the form and announces successful submission', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'پیام شما ثبت شد.' }),
    });
    renderWithProviders(<ContactPage />);

    fireEvent.change(screen.getByLabelText('نام'), {
      target: { value: 'علی' },
    });
    fireEvent.change(screen.getByLabelText('نام خانوادگی'), {
      target: { value: 'محمدی' },
    });
    fireEvent.change(screen.getByLabelText('ایمیل'), {
      target: { value: 'ali@example.com' },
    });
    fireEvent.change(screen.getByLabelText('پیام'), {
      target: { value: 'سوال درباره ثبت نام دارم.' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'ارسال پیام' }).closest('form')!);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'پیام شما ثبت شد.',
    );
  });

  it('shows a mailto fallback only when API submission fails', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    renderWithProviders(<ContactPage />);

    fireEvent.change(screen.getByLabelText('ایمیل'), {
      target: { value: 'ali@example.com' },
    });
    fireEvent.change(screen.getByLabelText('پیام'), {
      target: { value: 'سوال درباره ثبت نام دارم.' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'ارسال پیام' }).closest('form')!);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'ارسال پیام از طریق سامانه ناموفق بود.',
    );
    expect(screen.getByRole('link', { name: 'ارسال با ایمیل' })).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:'),
    );
  });

  it('associates server validation errors with the invalid field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        message: 'لطفاً اطلاعات واردشده را بررسی کنید.',
        fieldErrors: { email: ['ایمیل معتبر نیست'] },
      }),
    });
    renderWithProviders(<ContactPage />);

    fireEvent.submit(
      screen.getByRole('button', { name: 'ارسال پیام' }).closest('form')!,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'لطفاً اطلاعات واردشده را بررسی کنید.',
    );
    expect(screen.getByLabelText('ایمیل')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('ایمیل معتبر نیست')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'ارسال با ایمیل' })).toBeNull();
  });
});
