// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/crawler-news';

const createRequest = () =>
  ({
    method: 'GET',
    query: {},
  }) as never;

const createResponse = () => {
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return response as never as {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

describe('/api/crawler-news', () => {
  beforeEach(() => {
    vi.stubEnv('CRAWLER_API_URL', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns an empty news page when the crawler URL is not configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = createResponse();

    await handler(createRequest(), res as never);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        news: [],
        total: 0,
        page: 1,
        per_page: 10,
        stats: null,
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('bounds upstream requests with the configured fetch timeout', async () => {
    vi.stubEnv('CRAWLER_API_URL', 'https://crawler.example');
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            articles: [],
            total: 0,
            page: 1,
            per_page: 10,
          }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }),
    );
    const res = createResponse();

    await handler(createRequest(), res as never);

    expect(timeout).toHaveBeenCalledWith(5_000);
    expect(timeout).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not expose upstream exception details to the client', async () => {
    vi.stubEnv('CRAWLER_API_URL', 'https://crawler.example');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('internal host and token details')),
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = createResponse();

    await handler(createRequest(), res as never);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'خطا در دریافت اخبار',
    });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain(
      'internal host and token details',
    );
  });

  it('does not fabricate crawler engagement counts', async () => {
    vi.stubEnv('CRAWLER_API_URL', 'https://crawler.example');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            articles: [
              {
                id: 'article-1',
                title: 'خبر',
                summary: 'خلاصه',
                content: 'متن خبر',
                category: 'news',
                published_at: '2026-10-31T12:00:00Z',
                source: 'منبع',
                image_url: '',
                tags: [],
                importance_score: 0.5,
                url: 'https://example.com/news',
                entities: {
                  players: [],
                  teams: [],
                  coaches: [],
                  matches: [],
                },
                sentiment: { score: 0, label: 'neutral' },
                is_transfer_news: false,
              },
            ],
            total: 1,
            page: 1,
            per_page: 10,
          }),
        })
        .mockResolvedValueOnce({ ok: false }),
    );
    const res = createResponse();

    await handler(createRequest(), res as never);

    const body = res.json.mock.calls[0][0];
    expect(body.news[0]).not.toHaveProperty('likes');
    expect(body.news[0]).not.toHaveProperty('comments');
  });
});
