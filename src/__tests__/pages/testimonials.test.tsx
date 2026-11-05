import type { GetServerSidePropsContext } from 'next';
import { renderWithProviders, screen } from '@/test-utils';
import TestimonialsPage, {
  getServerSideProps,
} from '@/pages/testimonials';
import { getMilestones, getTestimonials } from '@/services/content';
import type {
  MilestoneViewModel,
  TestimonialViewModel,
} from '@/types/viewModels/content';

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/services/content', () => ({
  getMilestones: vi.fn(),
  getTestimonials: vi.fn(),
}));

vi.mock('@/lib/page-props', () => ({
  withSite: async (props: object) => ({ ...props, site: null }),
}));

describe('combined testimonials and honors page', () => {
  const testimonials: TestimonialViewModel[] = [
    {
      id: 'review-1',
      name: 'بازدیدکننده',
      role: 'مراجع',
      content: 'تجربه ثبت‌شده',
      image: null,
      rating: 5,
      improvement: null,
      date: null,
      programName: null,
    },
  ];
  const honors: MilestoneViewModel[] = [
    {
      id: 'honor-1',
      year: 1404,
      title: 'افتخار آکادمی',
      description: 'شرح افتخار',
    },
  ];

  it('loads published testimonials and verified academy honors together', async () => {
    vi.mocked(getTestimonials).mockResolvedValue(testimonials);
    vi.mocked(getMilestones).mockResolvedValue(honors);

    const result = await getServerSideProps(
      {} as GetServerSidePropsContext,
    );

    expect(getTestimonials).toHaveBeenCalledWith('GENERAL');
    expect(getMilestones).toHaveBeenCalledOnce();
    expect('props' in result && result.props).toMatchObject({
      testimonials,
      honors,
      site: null,
    });
  });

  it('renders both content sections on the testimonials route', () => {
    renderWithProviders(
      <TestimonialsPage site={null} testimonials={testimonials} honors={honors} />,
    );

    expect(
      screen.getByRole('heading', { name: 'افتخارات و دستاوردهای آکادمی' }),
    ).toBeInTheDocument();
    expect(screen.getByText('افتخار آکادمی')).toBeInTheDocument();
    expect(screen.getByText(/تجربه ثبت‌شده/)).toBeInTheDocument();
  });
});
