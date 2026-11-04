import { motion } from 'framer-motion';
import { PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import type { NewsArticleViewModel } from '@/types/viewModels/content';

interface HeroPaginationProps {
  slideCount: number;
  newsSlides: NewsArticleViewModel[];
  currentSlide: number;
  currentNewsSlide: number;
  onSlideChange: (index: number) => void;
  onNewsChange: (index: number) => void;
  canAutoplay: boolean;
  isAutoplayRunning: boolean;
  reducedMotion: boolean;
  motionOverride: boolean;
  onMotionOverride: () => void;
  onAutoplayPauseToggle: () => void;
}

export default function HeroPagination({
  slideCount,
  newsSlides,
  currentSlide,
  currentNewsSlide,
  onSlideChange,
  onNewsChange,
  canAutoplay,
  isAutoplayRunning,
  reducedMotion,
  motionOverride,
  onMotionOverride,
  onAutoplayPauseToggle,
}: HeroPaginationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="flex max-w-full flex-wrap items-center justify-center gap-2 pb-10"
      role="group"
      aria-label="اسلایدهای هیرو"
    >
      {Array.from({ length: slideCount }, (_, index) => (
        <button
          key={`slide-${index}`}
          type="button"
          aria-pressed={index === currentSlide}
          aria-label={`برو به اسلاید ${index + 1}`}
          onClick={() => onSlideChange(index)}
          className="group inline-flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          <span
            aria-hidden="true"
            className={`size-3 rounded-full transition-[color,background-color,transform] duration-300 ${
              index === currentSlide
                ? 'scale-x-[2.67] bg-white'
                : 'bg-white/40 group-hover:bg-white/70'
            }`}
          />
        </button>
      ))}
      {newsSlides.map((article, index) => (
        <button
          key={article.id}
          type="button"
          aria-pressed={index === currentNewsSlide}
          aria-label={`نمایش خبر ${index + 1}: ${article.title}`}
          onClick={() => onNewsChange(index)}
          className="group inline-flex h-11 w-11 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          <span
            aria-hidden="true"
            className={`size-3 rounded-full transition-[color,background-color,transform] duration-300 ${
              index === currentNewsSlide
                ? 'scale-x-[2.67] bg-white'
                : 'bg-white/40 group-hover:bg-white/70'
            }`}
          />
        </button>
      ))}
      {canAutoplay && (
        <button
          type="button"
          aria-label={isAutoplayRunning ? 'توقف نمایش خودکار' : 'شروع نمایش خودکار'}
          aria-pressed={isAutoplayRunning}
          onClick={() => {
            if (reducedMotion && !motionOverride) onMotionOverride();
            else onAutoplayPauseToggle();
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isAutoplayRunning ? (
            <PauseIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <PlayIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      )}
    </motion.div>
  );
}
