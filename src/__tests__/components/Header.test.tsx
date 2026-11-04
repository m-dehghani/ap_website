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
    MoonIcon: Icon,
    ShoppingBagIcon: Icon,
    SunIcon: Icon,
    UserIcon: Icon,
    XMarkIcon: Icon,
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
  return {
    motion: { div: MotionDiv },
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
