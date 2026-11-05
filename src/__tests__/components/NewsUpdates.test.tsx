import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NewsUpdates from '@/components/NewsUpdates';
import HeroNews from '@/components/hero/HeroNews';
import type {
  NewsArticleViewModel,
  NewsCategoryViewModel,
} from '@/types/viewModels/content';

const categories: NewsCategoryViewModel[] = [];

const article = (
  id: string,
  title: string,
  featured: boolean,
): NewsArticleViewModel => ({
  id,
  title,
  excerpt: 'خلاصه خبر',
  content: 'متن خبر',
  category: 'academy',
  type: 'NEWS',
  author: 'تحریریه',
  image: null,
  videoUrl: null,
  tags: [],
  readTimeMinutes: 1,
  likes: 0,
  comments: 0,
  featured,
  publishedAt: '2026-11-01T10:00:00.000Z',
});

describe('homepage academy news cards', () => {
  it('links the hero news item to its encoded article detail page', () => {
    render(<HeroNews article={article('featured/article', 'خبر ویژه', true)} />);

    expect(screen.getByRole('link', { name: /خبر ویژه/ })).toHaveAttribute(
      'href',
      '/news/featured%2Farticle',
    );
  });

  it('links featured and regular card actions to encoded stable article IDs', () => {
    render(
      <NewsUpdates
        categories={categories}
        articles={[
          article('featured/article', 'خبر ویژه', true),
          article('regular article', 'خبر عادی', false),
        ]}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'ادامه مطلب: خبر ویژه' }),
    ).toHaveAttribute('href', '/news/featured%2Farticle');
    expect(
      screen.getByRole('link', { name: 'بیشتر: خبر عادی' }),
    ).toHaveAttribute('href', '/news/regular%20article');
  });
});
