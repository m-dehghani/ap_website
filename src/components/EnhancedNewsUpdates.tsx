import { useState, useEffect } from 'react';
import { CalendarDaysIcon, ClockIcon, UserGroupIcon, CameraIcon, PlayIcon, ArrowRightIcon, GlobeAltIcon, HomeIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { CrawlerNewsApiResponse, CrawlerStats } from '@/types/api/crawler';
import type { NewsCardViewModel } from '@/types/viewModels/content';

function NewsAction({
  article,
  compact = false,
}: {
  article: NewsCardViewModel;
  compact?: boolean;
}) {
  const className = 'inline-flex items-center gap-1 font-medium text-navy-800 hover:text-navy-900 focus-visible:underline';

  if (article.url) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`مشاهده منبع: ${article.title}`}
      >
        {compact ? 'منبع' : 'مشاهده منبع'}
        <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
      </a>
    );
  }

  if (!article.content.trim()) return null;

  return (
    <details className="group">
      <summary className={`${className} cursor-pointer`}>
        ادامه مطلب
        <ArrowRightIcon
          className="w-4 h-4 transition-transform group-open:rotate-90"
          aria-hidden="true"
        />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {article.content}
      </p>
    </details>
  );
}

export default function EnhancedNewsUpdates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [visibleCount, setVisibleCount] = useState(6);
  const [externalNews, setExternalNews] = useState<NewsCardViewModel[]>([]);
  const [crawlerStats, setCrawlerStats] = useState<CrawlerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Academy news (existing static data)
  const academyNews: NewsCardViewModel[] = [
    {
      id: 1,
      title: 'قهرمانی تیم نوجوانان در مسابقات منطقه‌ای',
      excerpt: 'تیم نوجوانان آکادمی AP با نتیجه 3-1 در فینال مسابقات منطقه‌ای به قهرمانی رسید',
      content: 'در یک بازی پرهیجان، تیم نوجوانان آکادمی AP توانست با نمایش فوق‌العاده‌ای عنوان قهرمانی مسابقات منطقه‌ای را کسب کند. این قهرمانی اولین عنوان بزرگ آکادمی در سال 1402 محسوب می‌شود.',
      category: 'matches',
      date: '1402/08/15',
      author: 'مدیر آکادمی',
      image: '/api/placeholder/400/250',
      tags: ['قهرمانی', 'نوجوانان', 'مسابقات'],
      readTime: '3 دقیقه',
      likes: 156,
      comments: 23,
      type: 'academy',
      featured: true
    },
    {
      id: 2,
      title: 'برگزاری کمپ تابستانی ویژه',
      excerpt: 'کمپ تابستانی آکادمی AP با حضور مربیان برتر و برنامه‌های متنوع آغاز شد',
      content: 'کمپ تابستانی امسال با حضور بیش از 100 کودک و نوجوان برگزار شد. این کمپ شامل تمرینات فنی، بازی‌های تفریحی و اردوی یک روزه بود.',
      category: 'events',
      date: '1402/08/10',
      author: 'تیم اجرایی',
      image: '/api/placeholder/400/250',
      tags: ['کمپ تابستانی', 'کودکان', 'تفریح'],
      readTime: '2 دقیقه',
      likes: 89,
      comments: 12,
      type: 'academy',
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'همه اخبار', icon: '📰' },
    { id: 'matches', name: 'مسابقات', icon: '⚽' },
    { id: 'training', name: 'تمرینات', icon: '🏃' },
    { id: 'events', name: 'رویدادها', icon: '🎉' },
    { id: 'achievements', name: 'موفقیت‌ها', icon: '🏆' },
    { id: 'transfers', name: 'انتقالات', icon: '🔄' },
  ];

  const sourceTypes = [
      { id: 'all', name: 'همه منابع', icon: GlobeAltIcon },
      { id: 'academy', name: 'آکادمی AP', icon: HomeIcon },
      { id: 'external', name: 'اخبار خارجی', icon: GlobeAltIcon },
    ];

              const [retryTrigger, setRetryTrigger] = useState(0);

              useEffect(() => {
                let mounted = true;
                const runFetch = async () => {
                  if (selectedSource === 'academy') {
                    if (mounted) {
                      setExternalNews([]);
                    }
                    return;
                  }

                  setLoading(true);
                  setError(null);
    
                  try {
                    const params = new URLSearchParams({
                      category: selectedCategory,
                      source: selectedSource === 'external' ? 'all' : selectedSource,
                      limit: '20'
                    });
      
                    const response = await fetch(`/api/crawler-news?${params}`);
      
                    if (!response.ok) {
                      throw new Error('Failed to fetch external news');
                    }

                    const data: CrawlerNewsApiResponse = await response.json();
                    if (mounted) {
                      setExternalNews(data.news || []);
                      setCrawlerStats(data.stats);
                    }
                  } catch (err) {
                    if (mounted) {
                      console.error('Unable to load external news:', err);
                      setError('دریافت اخبار با مشکل مواجه شد. لطفاً دوباره تلاش کنید.');
                      setExternalNews([]);
                      setCrawlerStats(null);
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
              }, [selectedCategory, selectedSource, retryTrigger]);

              const handleRetry = () => {
                setRetryTrigger(prev => prev + 1);
              };

              // Combine and filter news
  const getAllNews = (): NewsCardViewModel[] => {
    let combinedNews: NewsCardViewModel[] = [];
    
    if (selectedSource === 'all' || selectedSource === 'academy') {
      combinedNews = [...combinedNews, ...academyNews];
    }
    
    if (selectedSource === 'all' || selectedSource === 'external') {
      combinedNews = [...combinedNews, ...externalNews];
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      combinedNews = combinedNews.filter(item => item.category === selectedCategory);
    }
    
    // Sort by importance and date
    return combinedNews.sort((a, b) => {
      // Featured items first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then by importance score (for external news)
      if (a.importanceScore && b.importanceScore) {
        return b.importanceScore - a.importanceScore;
      }
      
      // Finally by date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const filteredNews = getAllNews();
  const featuredNews = filteredNews.filter(item => item.featured);
  const regularNews = filteredNews.filter(item => !item.featured);
  const visibleNews = regularNews.slice(0, visibleCount);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': {
        return <PlayIcon className="w-5 h-5" />;
      }
      case 'gallery': {
        return <CameraIcon className="w-5 h-5" />;
        }
      case 'external': {
        return <GlobeAltIcon className="w-5 h-5" />;
      }
      case 'academy': {
        return <HomeIcon className="w-5 h-5" />;
      }
      default: {
        return <CalendarDaysIcon className="w-5 h-5" />;
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': {
        return 'bg-red-500';
      }
      case 'gallery': {
        return 'bg-purple-500';
        }
      case 'external': {
        return 'bg-blue-500';
      }
      case 'academy': {
        return 'bg-green-500';
      }
      default: {
        return 'bg-gray-500';
      }
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'video': {
        return 'ویدئو';
      }
      case 'gallery': {
        return 'گالری';
      }
      case 'external': {
        return 'خارجی';
      }
      case 'academy': {
        return 'آکادمی';
      }
      default: {
        return 'خبر';
      }
    }
  };

  const getSentimentIcon = (sentiment?: { score: number; label: string }) => {
    if (!sentiment) return null;
  
    switch (sentiment.label) {
      case 'positive': {
        return '😊';
      }
      case 'negative': {
        return '😔';
      }
      case 'neutral': {
        return '😐';
      }
      default: {
        return null;
      }
    }
  };

  return (
    <section className="py-20 bg-linear-to-br from-navy-50 to-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-navy-100 text-navy-800 text-sm font-medium mb-4">
            <CalendarDaysIcon className="w-4 h-4 ml-2" />
            اخبار و رویدادها
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            آخرین <span className="text-navy-800">اخبار</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            از آخرین اخبار آکادمی AP و دنیای فوتبال ایران مطلع شوید
          </p>
        </div>

        {/* Crawler Stats */}
        {crawlerStats && (
          <div className="mb-12 bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{crawlerStats.total_articles}</div>
                <div className="text-sm text-gray-600">کل اخبار</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{crawlerStats.sources_count}</div>
                <div className="text-sm text-gray-600">منابع فعال</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{crawlerStats.today_articles}</div>
                <div className="text-sm text-gray-600">اخبار امروز</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600 mb-2 flex items-center justify-center">
                  <FireIcon className="w-5 h-5 mr-1" />
                  ترند
                </div>
                <div className="text-sm text-gray-600">
                  {crawlerStats.trending_topics.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Source Type Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            {sourceTypes.map((source) => (
              <button
                key={source.id}
                type="button"
                onClick={() => {
                  setSelectedSource(source.id);
                  setVisibleCount(6);
                }}
                aria-pressed={selectedSource === source.id}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center ${
                  selectedSource === source.id
                    ? 'bg-navy-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-navy-700'
                }`}
              >
                <source.icon className="w-4 h-4 ml-2" />
                {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setSelectedCategory(category.id);
                setVisibleCount(6);
              }}
              aria-pressed={selectedCategory === category.id}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-navy-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="ml-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال دریافت اخبار...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8" role="alert">
            <p className="text-red-800">خطا: {error}</p>
            <button 
              type="button"
              onClick={handleRetry}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <SparklesIcon className="w-6 h-6 mr-2 text-amber-500" />
              اخبار ویژه
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredNews.slice(0, 2).map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative">
                    <div className="h-64 bg-linear-to-r from-navy-500 to-navy-600 flex items-center justify-center">
                      <div className="text-white text-6xl">📰</div>
                    </div>
                    <div className={`absolute top-4 right-4 ${getTypeColor(item.type)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                      {getTypeIcon(item.type)}
                      <span className="mr-1">{getTypeName(item.type)}</span>
                    </div>
                    {item.isTransferNews && (
                      <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        انتقال
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="w-4 h-4 ml-1" />
                        {item.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <UserGroupIcon className="w-4 h-4 ml-1" />
                        {item.author}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                    
                    {/* Entities Tags */}
                    {item.entities && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.entities.players.slice(0, 3).map((player, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                            👤 {player}
                          </span>
                        ))}
                        {item.entities.teams.slice(0, 2).map((team, idx) => (
                          <span key={idx} className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                            ⚽ {team}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                        <span>👍 {item.likes}</span>
                        <span>💬 {item.comments}</span>
                        <span>⏱️ {item.readTime}</span>
                        {item.sentiment && (
                          <span>{getSentimentIcon(item.sentiment)}</span>
                        )}
                      </div>
                      <NewsAction article={item} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleNews.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-gray-400 text-4xl">
                    {item.type === 'video' ? '🎥' : item.type === 'gallery' ? '📸' : item.type === 'external' ? '🌐' : '📰'}
                  </div>
                </div>
                <div className={`absolute top-4 right-4 ${getTypeColor(item.type)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
                  {getTypeIcon(item.type)}
                  <span className="mr-1">{getTypeName(item.type)}</span>
                </div>
                {item.isTransferNews && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    انتقال
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-navy-800 font-medium">{item.date}</span>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">{item.readTime}</span>
                    {item.sentiment && (
                      <span className="ml-2">{getSentimentIcon(item.sentiment)}</span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{item.excerpt}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-500">
                    <span>👍 {item.likes}</span>
                    <span>💬 {item.comments}</span>
                  </div>
                  <NewsAction article={item} compact />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleNews.length < regularNews.length && (
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 6)}
              className="bg-navy-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-navy-700 transition-colors shadow-lg"
            >
              مشاهده اخبار بیشتر
            </button>
          </div>
        )}
      </div>
    </section>
  );
} 
