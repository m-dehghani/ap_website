import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  CameraIcon,
  PlayIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { NEWS_CATEGORIES, NEWS_ARTICLES } from '@/constants/content';
import type {
  NewsArticleCardViewModel,
  NewsContentType,
} from '@/types/viewModels/content';

function NewsDetails({
  article,
  label,
}: {
  article: NewsArticleCardViewModel;
  label: string;
}) {
  return (
    <details className="group">
      <summary
        aria-label={`${label}: ${article.title}`}
        className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800 focus-visible:underline"
      >
        {label}
        <ArrowRightIcon
          className="h-4 w-4 transition-transform group-open:rotate-90"
          aria-hidden="true"
        />
      </summary>
      <p className="mt-3 text-gray-700 leading-relaxed">{article.content}</p>
    </details>
  );
}

function hasArticleImage(image: string | undefined): image is string {
  return Boolean(image && !image.startsWith('/api/placeholder/'));
}

const getTypeIcon = (type: NewsContentType) => {
  switch (type) {
    case 'video': {
      return <PlayIcon className="w-5 h-5" />;
    }
    case 'gallery': {
      return <CameraIcon className="w-5 h-5" />;
    }
    default: {
      return <CalendarDaysIcon className="w-5 h-5" />;
    }
  }
};

const getTypeLabel = (type: NewsContentType) => {
  switch (type) {
    case 'video': {
      return 'ویدئو';
    }
    case 'gallery': {
      return 'گالری';
    }
    default: {
      return 'خبر';
    }
  }
};

const getTypeColor = (type: NewsContentType) => {
  switch (type) {
    case 'video': {
      return 'bg-red-600';
    }
    case 'gallery': {
      return 'bg-purple-600';
    }
    default: {
      return 'bg-blue-600';
    }
  }
};

const getTypeBgColor = (type: NewsContentType) => {
  switch (type) {
    case 'video': {
      return 'from-red-500 to-red-600';
    }
    case 'gallery': {
      return 'from-purple-500 to-purple-600';
    }
    default: {
      return 'from-blue-500 to-blue-600';
    }
  }
};

// Featured News Card
function FeaturedNewsCard({ article, index }: { article: NewsArticleCardViewModel; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="relative">
        <div className={`h-64 bg-linear-to-r ${getTypeBgColor(article.type)} flex items-center justify-center relative overflow-hidden`}>
          {hasArticleImage(article.image) && (
            <img
              src={article.image}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 flex items-center justify-center">
            <div
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              {getTypeIcon(article.type)}
            </div>
          </div>
        </div>
        <div className={`absolute top-4 right-4 ${getTypeColor(article.type)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
          {getTypeIcon(article.type)}
          <span>{getTypeLabel(article.type)}</span>
        </div>
        {article.featured && (
          <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <StarIcon className="w-4 h-4 fill-current" />
            ویژه
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{article.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{article.readTime}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </motion.span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span role="img" aria-label="لایک">👍</span>
              {article.likes}
            </span>
            <span className="flex items-center gap-1">
              <span role="img" aria-label="نظر">💬</span>
              {article.comments}
            </span>
          </div>
          <NewsDetails article={article} label="ادامه مطلب" />
        </div>
      </div>
    </motion.div>
  );
}

// News Card Component
function NewsCard({ article, index }: { article: NewsArticleCardViewModel; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="relative">
        <div className={`h-48 bg-linear-to-br ${getTypeBgColor(article.type)} flex items-center justify-center relative overflow-hidden`}>
          {hasArticleImage(article.image) && (
            <img
              src={article.image}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 flex items-center justify-center">
            <div
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              {getTypeIcon(article.type)}
            </div>
          </div>
        </div>
        <div className={`absolute top-4 right-4 ${getTypeColor(article.type)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
          {getTypeIcon(article.type)}
          <span>{getTypeLabel(article.type)}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-700 font-medium">{article.date}</span>
          <span className="text-xs text-gray-500">{article.readTime}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-gray-600 line-clamp-3 text-sm">{article.excerpt}</p>

        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </motion.span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span role="img" aria-label="لایک">👍</span>
              {article.likes}
            </span>
            <span className="flex items-center gap-1">
              <span role="img" aria-label="نظر">💬</span>
              {article.comments}
            </span>
          </div>
          <NewsDetails article={article} label="بیشتر" />
        </div>
      </div>
    </motion.div>
  );
}

// Category Filter Component
function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: { 
  categories: typeof NEWS_CATEGORIES;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap justify-center gap-3 mb-12"
      role="group"
      aria-label="دسته‌بندی اخبار"
    >
      {categories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
            selectedCategory === category.id
              ? 'bg-navy-700 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={selectedCategory === category.id}
        >
          <span aria-hidden="true">{category.icon}</span>
          {category.name}
        </motion.button>
      ))}
    </motion.div>
  );
}

function NewsFollowCTA() {
  return (
    <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl bg-navy-800 p-8 text-center text-white sm:flex-row sm:text-right">
      <div>
        <h3 className="text-2xl font-bold mb-2">از اخبار آکادمی مطلع شوید</h3>
        <p className="text-navy-100">
          خبرها، رویدادها و دستاوردهای بازیکنان را در صفحه اخبار دنبال کنید.
        </p>
      </div>
      <Link
        href="/news"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-navy-800 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        مشاهده همه اخبار
        <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
      </Link>
    </div>
  );
}

// Load More Button Component
function LoadMoreButton({ onClick, hasMore }: { onClick: () => void; hasMore: boolean }) {
  if (!hasMore) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mt-12"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(14, 165, 233, 0.4)' }}
        whileTap={{ scale: 0.98 }}
        className="bg-linear-to-r from-primary-600 to-primary-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
      >
        مشاهده اخبار بیشتر
        <ArrowRightIcon className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}

export default function NewsUpdates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
    const [displayCount, setDisplayCount] = useState(6);

    const categories = NEWS_CATEGORIES;
  const allNews = NEWS_ARTICLES;

  const featuredNews = allNews.filter((item) => item.featured);
  const regularNews = allNews.filter((item) => !item.featured);

  const filteredNews = selectedCategory === 'all'
    ? regularNews
    : regularNews.filter((item) => item.category === selectedCategory);

  const displayedNews = filteredNews.slice(0, displayCount);
  const hasMoreNews = displayedNews.length < filteredNews.length;

  const handleLoadMore = useCallback(() => {
      setTimeout(() => {
        setDisplayCount(prev => prev + 6);
      }, 500);
    }, []);

  return (
    <section className="py-20 bg-linear-to-br from-navy-50 to-navy-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-navy-100 text-navy-800 text-sm font-medium mb-4">
            <CalendarDaysIcon className="w-4 h-4 ml-2" />
            اخبار و رویدادها
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            آخرین <span className="text-navy-800">اخبار</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            از آخرین اخبار، رویدادها و دستاوردهای آکادمی AP مطلع شوید
          </p>
        </motion.div>

        {/* Featured News */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">اخبار ویژه</h3>
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {featuredNews.length} خبر ویژه
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredNews.slice(0, 2).map((item, index) => (
              <FeaturedNewsCard key={item.id} article={item} index={index} />
            ))}
          </div>
        </motion.div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* News Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {displayedNews.map((item, index) => (
              <NewsCard key={item.id} article={item} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {displayedNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-gray-500"
          >
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">هیچ خبری برای این دسته‌بندی یافت نشد</p>
          </motion.div>
        )}

        {/* Load More Button */}
        <LoadMoreButton onClick={handleLoadMore} hasMore={hasMoreNews} />

        {/* Newsletter Signup */}
        <NewsFollowCTA />
      </div>
    </section>
  );
}
