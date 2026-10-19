import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next-seo
vi.mock('next-seo', () => ({
  NextSeo: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Mock heroicons
vi.mock('@heroicons/react/24/outline', () => {
  const icons = [
    'StarIcon', 'TrophyIcon', 'AcademicCapIcon', 'UserGroupIcon',
    'ChevronLeftIcon', 'ChevronRightIcon', 'ArrowLeftIcon', 'PlayIcon',
    'UsersIcon', 'PlayIcon', 'TrophyIcon', 'StarIcon', 'CalendarDaysIcon',
    'CheckCircleIcon'
  ];
  const mockComponents: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {};
  icons.forEach(name => {
    mockComponents[name] = ({ ...props }) => <svg {...props} data-testid={name} />;
  });
  return mockComponents;
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
    a: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr, options) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return String(date);
  }),
}));

vi.mock('date-fns/locale', () => ({
  faIR: {},
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));