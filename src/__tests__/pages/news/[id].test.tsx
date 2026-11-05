import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewsArticlePage, { getServerSideProps } from '@/pages/news/[id]';
import { getPublishedNewsArticleById } from '@/services/content';
import type { NewsArticleViewModel } from '@/types/viewModels/content';

vi.mock('@/services/content', () => ({
  getPublishedNewsArticleById: vi.fn(),
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/page-props', () => ({
  withSite: async (props: Record<string, unknown>) => ({
    ...props,
    site: null,
  }),
}));

vi.mock('next-seo', () => ({
  NextSeo: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div
      data-testid="article-seo"
      data-title={title}
      data-description={description}
    />
  ),
}));

const article: NewsArticleViewModel = {
  id: 'published-article',
  title: 'خبر منتشرشده آکادمی',
  excerpt: 'خلاصه خبر منتشرشده',
  content: 'متن کامل خبر منتشرشده',
  category: 'academy',
  type: 'NEWS',
  author: 'تحریریه',
  image: null,
  videoUrl: null,
  uploadedVideoUrl: null,
  aparatVideoUrl: null,
  tags: [],
  readTimeMinutes: 3,
  likes: 0,
  comments: 0,
  featured: false,
  publishedAt: '2026-11-01T10:00:00.000Z',
};

describe('/news/[id]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only published article props and never embeds draft content', async () => {
    vi.mocked(getPublishedNewsArticleById).mockResolvedValueOnce(article);
    const result = await getServerSideProps!({
      params: { id: article.id },
    } as never);

    expect(getPublishedNewsArticleById).toHaveBeenCalledWith(article.id);
    expect(result).toEqual({ props: { article, site: null } });

    vi.mocked(getPublishedNewsArticleById).mockResolvedValueOnce(null);
    const missing = await getServerSideProps!({
      params: { id: 'unpublished-article' },
    } as never);

    expect(missing).toEqual({ notFound: true });
    expect(missing).not.toHaveProperty('props');
  });

  it('returns not found without querying for a missing route parameter', async () => {
    const result = await getServerSideProps!({ params: {} } as never);

    expect(result).toEqual({ notFound: true });
    expect(getPublishedNewsArticleById).not.toHaveBeenCalled();
  });

  it('renders the existing article with metadata and a return-to-news link', () => {
    render(<NewsArticlePage article={article} />);

    expect(
      screen.getByRole('heading', { level: 1, name: article.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(article.content)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'بازگشت به اخبار' }),
    ).toHaveAttribute('href', '/news');
    expect(screen.getByTestId('article-seo')).toHaveAttribute(
      'data-title',
      article.title,
    );
    expect(screen.getByTestId('article-seo')).toHaveAttribute(
      'data-description',
      article.excerpt,
    );
  });

  it('renders validated uploaded and Aparat media references', () => {
    render(
      <NewsArticlePage
        article={{
          ...article,
          uploadedVideoUrl:
            '/uploads/550e8400-e29b-41d4-a716-446655440000.mp4',
          aparatVideoUrl: 'https://www.aparat.com/v/abc123',
        }}
      />,
    );

    expect(screen.getByLabelText(`ویدئوی ${article.title}`)).toHaveAttribute(
      'src',
      '/uploads/550e8400-e29b-41d4-a716-446655440000.mp4',
    );
    expect(
      screen.getByTitle(`ویدئوی ${article.title} در آپارات`),
    ).toHaveAttribute(
      'src',
      'https://www.aparat.com/video/video/embed/videohash/abc123',
    );
  });
});
