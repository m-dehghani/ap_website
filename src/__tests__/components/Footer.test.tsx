import { renderWithProviders, screen } from '@/test-utils';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('does not render empty contact or training information', () => {
    const { container } = renderWithProviders(<Footer site={null} />);

    expect(container.querySelector('a[href="tel:"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="mailto:"]')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'ساعات تمرین' }),
    ).not.toBeInTheDocument();
  });
});
