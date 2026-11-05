import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { imageOptimizationProps } from '@/lib/image-optimization';
import type { NewsArticleViewModel } from '@/types/viewModels/content';

export default function HeroNews({ article }: { article: NewsArticleViewModel }) {
  return (
    <div className="mx-auto hidden max-w-6xl pb-8 md:block" aria-live="off">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-red-200">تازه از آکادمی</p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            آخرین خبرها و دستاوردها
          </h2>
        </div>
        <Link
          href="/news"
          className="shrink-0 text-sm font-semibold text-white underline-offset-4 hover:underline"
        >
          همه خبرها
        </Link>
      </div>
      <div className="mx-auto max-w-4xl">
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="group flex min-h-36 items-center gap-4 rounded-2xl border border-white/15 bg-white/95 p-4 text-right shadow-lg transition-transform hover:-translate-y-1 focus-visible:outline-white sm:gap-6 sm:p-6"
        >
          {article.videoUrl ? (
            <video
              controls
              playsInline
              preload="none"
              poster={article.image ?? undefined}
              aria-label={article.title}
              className="h-28 w-28 shrink-0 rounded-xl bg-black object-cover sm:h-36 sm:w-48"
            >
              <source src={article.videoUrl} />
              مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
            </video>
          ) : article.image &&
            !article.image.startsWith('/api/placeholder/') ? (
            <Image
              src={article.image}
              alt=""
              width={192}
              height={144}
              {...imageOptimizationProps(article.image)}
              loading="lazy"
              className="h-28 w-28 shrink-0 rounded-xl object-cover sm:h-36 sm:w-48"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-4xl sm:h-36 sm:w-48"
            >
              ⚽
            </span>
          )}
          <Link
            href={`/news/${encodeURIComponent(article.id)}`}
            className="min-w-0 focus-visible:underline"
          >
            <span className="mb-1 block text-xs font-medium text-primary-700">
              {article.type === 'VIDEO' ? 'ویدئو' : 'خبر'} ·{' '}
              {article.publishedAt.slice(0, 10)}
            </span>
            <span className="line-clamp-2 block text-base font-bold leading-7 text-slate-900 group-hover:text-primary-700 sm:text-xl">
              {article.title}
            </span>
            <span className="mt-2 line-clamp-2 block text-sm leading-6 text-slate-600 sm:text-base">
              {article.excerpt}
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
