import { renderWithProviders, screen } from '@/test-utils';
import AboutPage from '@/pages/about';

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

const pageProps = (aboutContent: unknown[]) =>
  ({
    academyInfo: null,
    aboutContent,
    openingHours: { office: [], training: [] },
    statistics: {},
    staffMembers: [],
    facilities: [],
    site: null,
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
});
