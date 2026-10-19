import type { NewsCardViewModel } from '../viewModels/content';

export interface CrawlerArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  published_at: string;
  url: string;
  image_url?: string;
  category: string;
  tags: string[];
  entities: {
    players: string[];
    teams: string[];
    coaches: string[];
    matches: string[];
  };
  sentiment: {
    score: number;
    label: string;
  };
  is_transfer_news: boolean;
  importance_score: number;
}

export interface CrawlerArticlePage {
  articles: CrawlerArticle[];
  total: number;
  page: number;
  per_page: number;
}

export interface CrawlerStats {
  total_articles: number;
  sources_count: number;
  today_articles: number;
  trending_topics: string[];
  category_distribution?: Record<string, number>;
  sentiment_distribution?: Record<string, number>;
}

export interface CrawlerNewsItemViewModel extends NewsCardViewModel {
  source: string;
  url: string;
  entities: CrawlerArticle['entities'];
  sentiment: CrawlerArticle['sentiment'];
  isTransferNews: boolean;
  importanceScore: number;
}

export interface CrawlerNewsApiResponse {
  news: CrawlerNewsItemViewModel[];
  total: number;
  page: number;
  per_page: number;
  stats: CrawlerStats | null;
  sources: Array<{ id: string; name: string }>;
}
