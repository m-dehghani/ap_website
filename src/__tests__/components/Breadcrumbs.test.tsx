import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@/test-utils';
import Breadcrumbs from '@/components/Breadcrumbs';

describe('Breadcrumbs', () => {
  it('exposes an accessible ordered path and marks the current page', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'خانه', href: '/' },
          { label: 'فروشگاه', href: '/shop' },
          { label: 'کفش فوتبال' },
        ]}
      />,
    );

    const navigation = screen.getByRole('navigation', { name: 'مسیر صفحه' });
    const items = within(navigation).getAllByRole('listitem');

    expect(items).toHaveLength(3);
    expect(within(items[0]).getByRole('link', { name: 'خانه' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(within(items[1]).getByRole('link', { name: 'فروشگاه' })).toHaveAttribute(
      'href',
      '/shop',
    );
    expect(items[2]).toHaveTextContent('کفش فوتبال');
    expect(items[2]).toHaveAttribute('aria-current', 'page');
    expect(within(items[2]).queryByRole('link')).not.toBeInTheDocument();
  });
});
