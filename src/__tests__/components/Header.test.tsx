import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Header from '@/components/Header';

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

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

vi.mock('@heroicons/react/24/outline', () => {
  const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />;
  return {
    ArrowRightOnRectangleIcon: Icon,
    Bars3Icon: Icon,
    ChevronDownIcon: Icon,
    ComputerDesktopIcon: Icon,
    Cog6ToothIcon: Icon,
    HomeIcon: Icon,
    MoonIcon: Icon,
    ShoppingBagIcon: Icon,
    SunIcon: Icon,
    UserGroupIcon: Icon,
    UserIcon: Icon,
    XMarkIcon: Icon,
    BookOpenIcon: Icon,
    MegaphoneIcon: Icon,
    ChatBubbleLeftRightIcon: Icon,
    EnvelopeIcon: Icon,
    AcademicCapIcon: Icon,
  };
});

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const MotionDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  ));
  MotionDiv.displayName = 'MotionDiv';
  const MotionSpan = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
  >(({ children, ...props }, ref) => (
    <span ref={ref} {...props}>
      {children}
    </span>
  ));
  MotionSpan.displayName = 'MotionSpan';
  const MotionP = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(({ children, ...props }, ref) => (
    <p ref={ref} {...props}>
      {children}
    </p>
  ));
  MotionP.displayName = 'MotionP';
  return {
    motion: { div: MotionDiv, span: MotionSpan, p: MotionP },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, logout: vi.fn() }),
}));

vi.mock('@/hooks/useThemePreference', () => ({
  useThemePreference: () => ({ preference: 'light' }),
  useThemeSelection: () => ({
    preference: 'light',
    selectThemePreference: vi.fn(),
    saving: false,
  }),
}));

describe('Header mobile navigation', () => {
  it('renders distinct animated icons and styling for every main navigation item', () => {
    const { container } = render(<Header />);
    const navigation = screen.getByRole('navigation', { name: 'منوی اصلی' });
    const links = Array.from(navigation.querySelectorAll('a[href]'));

    expect(links).toHaveLength(8);
    expect(navigation).toHaveClass('flex-nowrap');
    expect(navigation).toHaveClass('2xl:flex');
    for (const link of links) {
      expect(link.querySelector('svg')).toBeInTheDocument();
      expect(link.className).toContain('group');
      expect(link).toHaveClass('text-sm');
      expect(link).toHaveAttribute('aria-label');
      expect(link).toHaveAttribute('title', link.getAttribute('aria-label'));
      expect(link).toHaveTextContent(link.getAttribute('aria-label') ?? '');
    }

    expect(
      screen.getByRole('button', { name: 'باز کردن منوی اصلی' }),
    ).toHaveClass('2xl:hidden');
    expect(screen.getByText('افشین پیروانی')).toBeInTheDocument();
    expect(container.querySelector('a[href="/shop"]')).toHaveClass(
      'bg-secondary-500',
    );
    expect(container.querySelector('a[href="/shop"]')).not.toHaveClass(
      'bg-primary-600',
    );
  });

  it('uses readable text sizing in the collapsed main menu', () => {
    const { container } = render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'باز کردن منوی اصلی' }));

    const links = Array.from(
      container.querySelectorAll<HTMLAnchorElement>(
        '#mobile-navigation nav[aria-label="منوی اصلی"] a',
      ),
    ).filter(
      (link) =>
        !['/shop/cart', '/register', '/login'].includes(link.getAttribute('href') ?? ''),
    );
    expect(links).toHaveLength(8);
    for (const link of links) {
      expect(link).toHaveClass('text-base', 'font-semibold');
    }
  });

  it('keeps Tab and Shift+Tab inside the open mobile menu', async () => {
    const { container } = render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'باز کردن منوی اصلی' }));

    const menu = container.querySelector('#mobile-navigation');
    expect(menu).not.toBeNull();
    const controls = Array.from(
      menu!.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)'),
    );
    const first = controls[0];
    const last = controls[controls.length - 1];

    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('closes on Escape and returns focus to the menu trigger', async () => {
    const { container } = render(<Header />);
    const trigger = screen.getByRole('button', { name: 'باز کردن منوی اصلی' });
    fireEvent.click(trigger);
    const menu = container.querySelector('#mobile-navigation');
    expect(menu).not.toBeNull();

    fireEvent.keyDown(menu!, { key: 'Escape' });

    await waitFor(() => {
      expect(container.querySelector('#mobile-navigation')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
