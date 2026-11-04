import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@/test-utils';
import { createMockProgram } from '@/test-utils';
import { ComparisonTable } from '@/components/Programs';

vi.mock('@heroicons/react/24/outline', () => {
  const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />;
  return {
    CalendarDaysIcon: Icon,
    ChartBarIcon: Icon,
    ClockIcon: Icon,
    CurrencyDollarIcon: Icon,
    TrophyIcon: Icon,
    UserGroupIcon: Icon,
  };
});

describe('Program comparison on narrow screens', () => {
  it('shows each program as a definition list instead of a horizontally overflowing table', () => {
    const programs = [
      createMockProgram({ id: 'program-1', name: 'برنامه پایه' }),
      createMockProgram({ id: 'program-2', name: 'برنامه پیشرفته' }),
    ];
    const { container } = render(
      <ComparisonTable programs={programs} selectedProgram={0} />,
    );

    const mobileComparison = container.querySelector('[data-testid="mobile-comparison"]');
    expect(mobileComparison).toBeInTheDocument();
    const mobileCards = within(mobileComparison as HTMLElement).getAllByRole('article');
    expect(mobileCards).toHaveLength(2);
    expect(within(mobileCards[0]).getByRole('heading', {
      name: 'برنامه پایه',
    })).toBeInTheDocument();
    expect(within(mobileCards[0]).getByText('محدوده سنی')).toBeInTheDocument();
    expect(within(mobileCards[0]).getByText('12-15 سال')).toBeInTheDocument();
    expect(container.querySelector('.overflow-x-auto')).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveClass('hidden', 'xl:table');
  });
});
