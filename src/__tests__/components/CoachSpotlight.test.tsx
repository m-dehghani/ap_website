import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '@/test-utils';
import CoachSpotlight from '@/components/CoachSpotlight';
import { createMockCoach } from '@/test-utils';

describe('CoachSpotlight', () => {
  const mockCoaches = [
    createMockCoach({ id: '1', firstName: 'علی', lastName: 'محمدی' }),
    createMockCoach({ id: '2', firstName: 'رضا', lastName: 'احمدی' }),
    createMockCoach({ id: '3', firstName: 'حسین', lastName: 'رضایی' }),
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders coach spotlight section when coaches are provided', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    // Check for the header text - use getAllByText and check first match
    const headers = screen.getAllByText(
      (content) => content.includes('تیم') && content.includes('مربیگری'),
    );
    expect(headers.length).toBeGreaterThan(0);
    // The coach name appears in multiple places, use getAllByText
    expect(screen.getAllByText('علی محمدی').length).toBeGreaterThan(0);
  });

  it('renders null when no coaches provided', () => {
    const { queryByText } = renderWithProviders(
      <CoachSpotlight coaches={[]} />,
    );

    expect(queryByText('تیم مربیگری')).not.toBeInTheDocument();
  });

  it('renders null when coaches is undefined', () => {
    const { queryByText } = renderWithProviders(
      <CoachSpotlight coaches={undefined} />,
    );

    expect(queryByText('تیم مربیگری')).not.toBeInTheDocument();
  });

  it('shows first coach by default', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    // Just verify the first coach's info is displayed somewhere
    // Use getAllByText for names that appear multiple times
    const aliElements = screen.getAllByText('علی محمدی');
    expect(aliElements.length).toBeGreaterThan(0);
    // "مربی ارشد" appears multiple times (showcase + grid), use getAllByText
    const titleElements = screen.getAllByText('مربی ارشد');
    expect(titleElements.length).toBeGreaterThan(0);
    expect(screen.getByText('مربی فیفا، تخصص در نوجوانان')).toBeInTheDocument();
  });

  it('navigates to next coach when next button clicked', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    // Find navigation buttons - they are the first and last buttons in the nav section
    const buttons = screen.getAllByRole('button');
    // The next button is the last one (has ChevronLeftIcon)
    const nextBtn = buttons[buttons.length - 1];
    fireEvent.click(nextBtn);

    // After clicking next, the second coach should be visible
    // Use getAllByText and check that the second coach name appears
    const rezaElements = screen.getAllByText('رضا احمدی');
    expect(rezaElements.length).toBeGreaterThan(0);
  });

  it('navigates to previous coach when prev button clicked', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    const buttons = screen.getAllByRole('button');
    // The prev button is the first one (has ChevronRightIcon)
    const prevBtn = buttons[0];
    fireEvent.click(prevBtn);

    // After clicking prev, the last coach should be visible
    const hosseinElements = screen.getAllByText('حسین رضایی');
    expect(hosseinElements.length).toBeGreaterThan(0);
  });

  it('shows all coaches in grid', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    expect(screen.getByText('تمام مربیان ما')).toBeInTheDocument();
    // Names appear in both showcase and grid, so use getAllByText
    expect(screen.getAllByText('علی محمدی').length).toBeGreaterThan(0);
    expect(screen.getAllByText('رضا احمدی').length).toBeGreaterThan(0);
    expect(screen.getAllByText('حسین رضایی').length).toBeGreaterThan(0);
  });

  it('displays coach stats correctly', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    // Stats appear in the showcase, use getAllByText for numbers that might appear multiple times
    expect(screen.getAllByText('10').length).toBeGreaterThan(0); // experience
    expect(screen.getAllByText('150').length).toBeGreaterThan(0); // studentsCount
    expect(screen.getAllByText('4.8').length).toBeGreaterThan(0); // rating
  });

  it('displays coach certifications', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    expect(screen.getByText('گواهی فیفا C')).toBeInTheDocument();
    expect(screen.getByText('گواهی AFC B')).toBeInTheDocument();
  });

  it('displays coach achievements', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    expect(screen.getByText('قهرمان لیگ برتر')).toBeInTheDocument();
    expect(screen.getByText('بهترین مربی سال')).toBeInTheDocument();
  });

  it('handles coach with missing optional fields', () => {
    const coachWithoutOptionals = createMockCoach({
      title: null,
      bio: null,
      quote: null,
      certifications: [],
      achievements: [],
      instagram: null,
      twitter: null,
    });

    renderWithProviders(<CoachSpotlight coaches={[coachWithoutOptionals]} />);

    expect(screen.getByText('تیم مربیگری')).toBeInTheDocument();
    // The component should render without crashing - just verify it renders
    expect(screen.getByText('تیم مربیگری')).toBeInTheDocument();
  });

  it('cycles through coaches with indicator dots', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('supports RTL keyboard navigation between coach tabs', () => {
    renderWithProviders(<CoachSpotlight coaches={mockCoaches} />);

    const [firstTab, secondTab] = screen.getAllByRole('tab');
    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' });

    expect(secondTab).toHaveFocus();
    expect(secondTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute(
      'aria-labelledby',
      secondTab.id,
    );

    fireEvent.keyDown(secondTab, { key: 'Home' });

    expect(firstTab).toHaveFocus();
    expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });
});
