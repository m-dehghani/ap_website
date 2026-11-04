import { renderWithProviders, screen } from '@/test-utils';
import type { ImgHTMLAttributes } from 'react';
import AboutPage from '@/pages/about';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const pageProps = (
  aboutContent: unknown[],
  overrides: Record<string, unknown> = {},
) =>
  ({
    academyInfo: null,
    aboutContent,
    openingHours: { office: [], training: [] },
    statistics: {},
    staffMembers: [],
    facilities: [],
    site: null,
    ...overrides,
  }) as never;

describe('academy history section', () => {
  it('renders the history content maintained in About CMS', () => {
    renderWithProviders(
      <AboutPage
        {...pageProps([
          {
            id: 'history-1',
            section: 'history',
            title: 'تاریخچه آکادمی',
            content: { paragraphs: ['تاریخچه واردشده در پنل مدیریت'] },
          },
        ])}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'تاریخچه آکادمی' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('تاریخچه واردشده در پنل مدیریت'),
    ).toBeInTheDocument();
  });

  it('does not invent history when CMS content is absent', () => {
    renderWithProviders(<AboutPage {...pageProps([])} />);

    expect(
      screen.getByText('تاریخچه آکادمی هنوز در پنل مدیریت ثبت نشده است.'),
    ).toBeInTheDocument();
  });

  it('does not present unsupported mission, vision, values, or outcome claims', () => {
    renderWithProviders(<AboutPage {...pageProps([])} />);

    expect(
      screen.getByText('اطلاعات مأموریت آکادمی هنوز در پنل مدیریت ثبت نشده است.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('اطلاعات چشم‌انداز آکادمی هنوز در پنل مدیریت ثبت نشده است.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('ارزش‌های آکادمی هنوز در پنل مدیریت ثبت نشده است.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/برترین آکادمی|بهترین مربیان|نسل آینده فوتبال/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('کیفیت در آموزش'),
    ).not.toBeInTheDocument();
  });

  it('limits the academy overview to four statistics', () => {
    renderWithProviders(
      <AboutPage
        {...pageProps([], {
          statistics: Object.fromEntries(
            Array.from({ length: 6 }, (_, index) => [
              `stat-${index + 1}`,
              {
                key: `stat-${index + 1}`,
                label: `شاخص ${index + 1}`,
                value: `${index + 1}`,
                description: null,
              },
            ]),
          ),
        })}
      />,
    );

    expect(screen.getByText('شاخص 1')).toBeInTheDocument();
    expect(screen.getByText('شاخص 4')).toBeInTheDocument();
    expect(screen.queryByText('شاخص 5')).not.toBeInTheDocument();
    expect(screen.queryByText('شاخص 6')).not.toBeInTheDocument();
  });

  it('renders staff photos on the About page when an image is configured', () => {
    const { container } = renderWithProviders(
      <AboutPage
        {...pageProps([], {
          staffMembers: [
            {
              id: 'staff-1',
              name: 'عضو تیم',
              role: 'مدیر',
              bio: 'معرفی',
              initials: 'م',
              image: '/api/uploads/staff-photo.png',
            },
          ],
        })}
      />,
    );

    expect(
      container.querySelector('img[src="/api/uploads/staff-photo.png"]'),
    ).toBeInTheDocument();
  });
});
