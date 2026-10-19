import { useState, useEffect } from 'react';
import { 
  NewspaperIcon, 
  FireIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  ChartBarIcon,
  ClockIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type {
  CrawlerNewsApiResponse,
  CrawlerNewsItemViewModel,
  CrawlerStats
} from '@/types/api/crawler';

interface NewsFilters {
  category: string;
  source: string;
  sentiment: string;
  importance_min: number;
  date_range: string;
}

export default function FootballNewsDashboard() {
  const [news, setNews] = useState<CrawlerNewsItemViewModel[]>([]);
  const [stats, setStats] = useState<CrawlerStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [filters, setFilters] = useState<NewsFilters>({
      category: 'all',
      source: 'all',
      sentiment: 'all',
      importance_min: 0.3,
      date_range: 'week'
    });

    useEffect(() => {
      let mounted = true;
      const runFetch = async () => {
        setLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({
            category: filters.category,
            source: filters.source,
            sentiment: filters.sentiment,
            importance_min: filters.importance_min.toString(),
            date_range: filters.date_range,
            limit: '30',
            search: searchTerm
          });
          const response = await fetch(`/api/crawler-news?${params}`);
          if (!response.ok) {
            throw new Error('Failed to fetch news');
          }
          const data: CrawlerNewsApiResponse = await response.json();
          if (mounted) {
            setNews(data.news || []);
            setStats(data.stats);
          }
        } catch (err) {
          if (mounted) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت اخبار');
            setNews([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      runFetch();

      return () => {
        mounted = false;
      };
    }, [filters, searchTerm, refreshTrigger]);

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      // The effect will handle the fetch when searchTerm changes
    };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'neutral': return '😐';
      default: return '😐';
    }
  };

  const getImportanceLevel = (score: number) => {
    if (score >= 0.8) return { level: 'بالا', color: 'bg-red-500' };
    if (score >= 0.6) return { level: 'متوسط', color: 'bg-yellow-500' };
    return { level: 'کم', color: 'bg-gray-500' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transfers': return '🔄';
      case 'match_results': return '⚽';
      case 'training': return '🏃';
      case 'league_news': return '🏆';
      case 'player_news': return '👤';
      default: return '📰';
    }
  };

  const filteredNews = news.filter(item => 
    !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendingNews = news.filter(item => item.importanceScore > 0.7).slice(0, 5);
  const transferNews = news.filter(item => item.isTransferNews).slice(0, 3);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-4">
            <GlobeAltIcon className="w-4 h-4 ml-2" />
            دشبورد اخبار فوتبال
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            اخبار <span className="text-blue-600">فوتبال ایران</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            آخرین اخبار، انتقالات و تحلیل‌های فوتبال از معتبرترین منابع کشور
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">کل اخبار</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total_articles}</p>
                </div>
                <NewspaperIcon className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">اخبار امروز</p>
                  <p className="text-3xl font-bold text-green-600">{stats.today_articles}</p>
                </div>
                <ClockIcon className="w-12 h-12 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">منابع فعال</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.sources_count}</p>
                </div>
                <GlobeAltIcon className="w-12 h-12 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">موضوعات ترند</p>
                  <p className="text-lg font-bold text-red-600">{stats.trending_topics.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">↑</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجو در اخبار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">همه دسته‌ها</option>
                <option value="transfers">انتقالات</option>
                <option value="match_results">نتایج بازی</option>
                <option value="league_news">اخبار لیگ</option>
                <option value="player_news">اخبار بازیکنان</option>
              </select>

              <select
                value={filters.source}
                onChange={(e) => setFilters({...filters, source: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">همه منابع</option>
                <option value="varzesh3">ورزش سه</option>
                <option value="persian_football">فوتبال پارسیان</option>
                <option value="football_iran">فوتبال ایران</option>
              </select>

              <select
                value={filters.sentiment}
                onChange={(e) => setFilters({...filters, sentiment: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">همه احساسات</option>
                <option value="positive">مثبت</option>
                <option value="neutral">خنثی</option>
                <option value="negative">منفی</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main News Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">آخرین اخبار</h2>
              <button
                onClick={() => setRefreshTrigger(previous => previous + 1)}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">در حال دریافت اخبار...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* News List */}
            <div className="space-y-6">
              {filteredNews.map((item) => {
                const importance = getImportanceLevel(item.importanceScore);
                
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                          <div>
                            <span className="text-sm font-medium text-gray-600">{item.source}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{item.date}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(item.sentiment.label)}`}>
                                {getSentimentIcon(item.sentiment.label)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${importance.color}`}></div>
                          <span className="text-xs text-gray-500">{importance.level}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.title}
                        </a>
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 4).map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Entities */}
                      <div className="space-y-2 mb-4">
                        {item.entities.players.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="text-xs text-gray-500 mr-2">بازیکنان:</span>
                            {item.entities.players.slice(0, 3).map((player, idx) => (
                              <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                {player}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.entities.teams.length > 0 && (
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="text-xs text-gray-500 mr-2">تیم‌ها:</span>
                            {item.entities.teams.slice(0, 3).map((team, idx) => (
                              <span key={idx} className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                                {team}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          {item.isTransferNews && (
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                              انتقال
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            امتیاز: {(item.importanceScore * 10).toFixed(1)}/10
                          </span>
                        </div>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          مشاهده منبع
                          <ArrowRightIcon className="w-4 h-4 mr-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FireIcon className="w-5 h-5 text-red-500 mr-2" />
                موضوعات ترند
              </h3>
              <div className="space-y-3">
                {trendingNews.map((item) => (
                  <div key={item.id} className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-red-600">
                        {item.title}
                      </a>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer News */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="w-5 h-5 text-blue-500 mr-2" />
                اخبار انتقالات
              </h3>
              <div className="space-y-3">
                {transferNews.map((item) => (
                  <div key={item.id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {item.title}
                      </a>
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics Chart */}
            {stats && stats.trending_topics.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="w-5 h-5 text-green-500 mr-2" />
                  کلیدواژه‌های پربازدید
                </h3>
                <div className="space-y-2">
                  {stats.trending_topics.slice(0, 8).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{topic}</span>
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${100 - (index * 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 