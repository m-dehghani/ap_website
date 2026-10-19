import type { NextApiRequest, NextApiResponse } from 'next';
import type { CrawlerArticle, CrawlerArticlePage } from '@/types/api/crawler';
import { formatPersianDate } from '@/lib/format';

// Transform crawler data to website format
function transformCrawlerToWebsite(crawlerData: CrawlerArticle[]) {
  return crawlerData.map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.summary,
    content: article.content,
    category: mapCrawlerCategory(article.category),
    date: formatPersianDate(article.published_at),
    author: article.source,
    image: article.image_url || '/api/placeholder/400/250',
    tags: article.tags,
    readTime: calculateReadTime(article.content),
    likes: Math.floor(Math.random() * 100), // Placeholder
    comments: Math.floor(Math.random() * 20), // Placeholder
    type: 'external',
    featured: article.importance_score > 0.8,
    source: article.source,
    url: article.url,
    entities: article.entities,
    sentiment: article.sentiment,
    isTransferNews: article.is_transfer_news,
    importanceScore: article.importance_score
  }));
}

function mapCrawlerCategory(category: string): string {
  const categoryMap: { [key: string]: string } = {
    'match_results': 'matches',
    'transfers': 'achievements',
    'training': 'training',
    'news': 'matches',
    'league_news': 'matches',
    'player_news': 'achievements',
    'coach_news': 'training'
  };
  return categoryMap[category] || 'matches';
}

function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} دقیقه`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      page = 1, 
      category = 'all', 
      limit = 10,
      importance_min = 0.3,
      source = 'all'
    } = req.query;

    // Construct crawler API URL
    const crawlerBaseUrl = process.env.CRAWLER_API_URL || 'http://localhost:8000';
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: limit.toString(),
      importance_min: importance_min.toString(),
      ...(category !== 'all' && { category: category.toString() }),
      ...(source !== 'all' && { source: source.toString() })
    });

    const response = await fetch(`${crawlerBaseUrl}/api/articles?${params}`);
    
    if (!response.ok) {
      throw new Error(`Crawler API error: ${response.status}`);
    }

    const crawlerData: CrawlerArticlePage = await response.json();
    const transformedData = transformCrawlerToWebsite(crawlerData.articles);

    // Get additional stats
    const statsResponse = await fetch(`${crawlerBaseUrl}/api/stats`);
    const stats = statsResponse.ok ? await statsResponse.json() : null;

    res.status(200).json({
      news: transformedData,
      total: crawlerData.total,
      page: crawlerData.page,
      per_page: crawlerData.per_page,
      stats: stats,
      sources: [
        { id: 'all', name: 'همه منابع' },
        { id: 'varzesh3', name: 'ورزش سه' },
        { id: 'persian_football', name: 'فوتبال پارسیان' },
        { id: 'football_iran', name: 'فوتبال ایران' },
        { id: 'isna', name: 'ایسنا' }
      ]
    });

  } catch (error) {
    console.error('Error fetching crawler news:', error);
    res.status(500).json({ 
      message: 'خطا در دریافت اخبار',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 