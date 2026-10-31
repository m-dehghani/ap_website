import { renderWithProviders, screen } from '@/test-utils';
import AcademyHonors from '@/components/SuccessStories';
import Testimonials from '@/components/Testimonials';
import type {
  MilestoneViewModel,
  TestimonialViewModel,
} from '@/types/viewModels/content';

describe('academy honors presentation', () => {
  it('shows only supplied academy honors and a neutral empty state', () => {
    const honors: MilestoneViewModel[] = [
      {
        id: 'honor-1',
        year: 1404,
        title: 'افتخار آکادمی',
        description: 'شرح افتخار',
      },
    ];

    const { rerender } = renderWithProviders(<AcademyHonors honors={honors} />);

    expect(
      screen.getByRole('heading', { name: 'افتخارات و دستاوردهای آکادمی' }),
    ).toBeInTheDocument();
    expect(screen.getByText('افتخار آکادمی')).toBeInTheDocument();
    expect(screen.queryByText('داستان‌های موفقیت')).not.toBeInTheDocument();

    rerender(<AcademyHonors honors={[]} />);
    expect(
      screen.getByText('هنوز افتخار تأییدشده‌ای برای نمایش ثبت نشده است.'),
    ).toBeInTheDocument();
  });
});

describe('testimonials presentation', () => {
  it('renders reviews independently without unsupported stats or outcomes', () => {
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

    renderWithProviders(<Testimonials testimonials={testimonials} />);

    expect(
      screen.getByRole('heading', { name: 'نظرات و تجربه‌ها' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/تجربه ثبت‌شده/)).toBeInTheDocument();
    expect(screen.queryByText('آمار و ارقام')).not.toBeInTheDocument();
    expect(screen.queryByText(/صدها بازیکن/)).not.toBeInTheDocument();
  });

  it('shows a neutral empty state when there are no reviews', () => {
    renderWithProviders(<Testimonials testimonials={[]} />);

    expect(
      screen.getByText('هنوز دیدگاهی برای نمایش ثبت نشده است.'),
    ).toBeInTheDocument();
  });
});
