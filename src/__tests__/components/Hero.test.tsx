import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ImgHTMLAttributes } from 'react';
import Hero from '@/components/Hero';
import type { NewsArticleViewModel } from '@/types/viewModels/content';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const slides = [
  {
    title: 'Hero One',
    subtitle: 'Academy One',
    description: 'First admin slide',
    cta: { label: 'Join', href: '/register' },
    ctaSecondary: { label: 'About', href: '/about' },
    bgGradient: 'from-primary-900 to-primary-700',
    stats: {},
  },
  {
    title: 'Hero Two',
    subtitle: 'Academy Two',
    description: 'Second admin slide',
    cta: { label: 'Join', href: '/register' },
    ctaSecondary: { label: 'About', href: '/about' },
    bgGradient: 'from-primary-900 to-primary-700',
    stats: {},
  },
];

const recentNews: NewsArticleViewModel[] = [1, 2, 3].map((id) => ({
  id: String(id),
  title: `News ${id}`,
  excerpt: `Excerpt ${id}`,
  content: `Content ${id}`,
  category: 'training',
  type: 'NEWS',
  author: 'Academy',
  image: null,
  videoUrl: null,
  tags: [],
  readTimeMinutes: 1,
  likes: 0,
  comments: 0,
  featured: false,
  publishedAt: '2026-10-25T00:00:00.000Z',
}));

describe('Hero carousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'matchMedia',
      vi.fn((media: string) => ({
        matches: false,
        media,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('rotates admin slides and the three newest news items every three seconds', () => {
    render(
      <Hero
        slides={slides}
        achievements={[]}
        statLabels={{}}
        recentNews={recentNews}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Hero One' })).toBeInTheDocument();
    expect(screen.getByText('News 1')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole('heading', { name: 'Hero Two' })).toBeInTheDocument();
    expect(screen.getByText('News 2')).toBeInTheDocument();
  });

  it('pauses automatic rotation when the pause control is activated', () => {
    render(
      <Hero
        slides={slides}
        achievements={[]}
        statLabels={{}}
        recentNews={recentNews}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'توقف نمایش خودکار' }));

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(screen.getByRole('heading', { name: 'Hero One' })).toBeInTheDocument();
    expect(screen.getByText('News 1')).toBeInTheDocument();
  });
});
