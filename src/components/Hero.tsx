import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { getIcon } from '@/lib/icons';
import HeroNews from '@/components/hero/HeroNews';
import HeroPagination from '@/components/hero/HeroPagination';
import HeroParticleSystem from '@/components/hero/HeroParticleSystem';
import HeroStats from '@/components/hero/HeroStats';
import type { HeroProps } from '@/components/hero/types';

export default function Hero({
  slides,
  achievements,
  statLabels,
  recentNews,
}: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewsSlide, setCurrentNewsSlide] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [motionOverride, setMotionOverride] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const newsSlides = recentNews.slice(0, 3);
  const currentNews = newsSlides[currentNewsSlide];
  const currentSlideData = slides[currentSlide] ?? slides[0];
  const isInteracting = isHovered || hasFocus;
  const canAutoplay = slides.length > 1 || newsSlides.length > 1;
  const isAutoplayRunning =
    canAutoplay &&
    !autoplayPaused && (!reducedMotion || motionOverride);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const updatePreference = () => setReducedMotion(motionPreference.matches);
    updatePreference();
    motionPreference.addEventListener('change', updatePreference);
    return () =>
      motionPreference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!canAutoplay || autoplayPaused || isInteracting) return;
    if (reducedMotion && !motionOverride) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setCurrentSlide((index) =>
        slides.length > 1 ? (index + 1) % slides.length : index,
      );
      setCurrentNewsSlide((index) =>
        newsSlides.length > 1 ? (index + 1) % newsSlides.length : index,
      );
    }, 3000);

    return () => window.clearInterval(timer);
  }, [
    autoplayPaused,
    canAutoplay,
    isInteracting,
    motionOverride,
    newsSlides.length,
    reducedMotion,
    slides.length,
  ]);

  useEffect(() => {
    if (!currentSlideData) return;
    let statsTimer: number | undefined;
    const animationTimer = window.setTimeout(() => {
      setStatsAnimated(false);
      statsTimer = window.setTimeout(() => setStatsAnimated(true), 100);
    }, 0);
    return () => {
      window.clearTimeout(animationTimer);
      if (statsTimer !== undefined) window.clearTimeout(statsTimer);
    };
  }, [currentSlide, currentSlideData]);

  if (slides.length === 0 && newsSlides.length === 0) {
    return null;
  }

  return (
    <section
      className="home-hero relative flex min-h-[70svh] items-center overflow-hidden md:min-h-[92vh]"
      aria-label="اسلایدهای آکادمی و تازه‌ترین خبرها"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setHasFocus(false);
        }
      }}
    >
      <div
        className={`absolute inset-0 bg-linear-to-br ${
          currentSlideData?.bgGradient ?? 'from-primary-900 via-primary-800 to-navy-900'
        }`}
      >
        <div className="absolute inset-[-4%] bg-gradient-mesh opacity-40 animate-gradient-shift" />
        <div className="absolute inset-0 bg-black/25" />
        <HeroParticleSystem
          particleCount={40}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="relative z-10 w-full">
        <div className="container-custom">
          {currentSlideData && (
          <div className="grid min-h-[62svh] items-center gap-10 py-10 md:min-h-[80vh] md:py-20 xl:gap-16 lg:grid-cols-2">
            <div className="text-center lg:text-right space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <TrophyIcon className="h-5 w-5 text-gold-400" />
                  آکادمی فوتبال درجه یک
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="space-y-4">
                  <h1
                    id="hero-title"
                    className="home-hero-title text-3xl font-extrabold leading-tight text-white text-balance sm:text-4xl lg:text-5xl xl:text-6xl"
                  >
                    {currentSlideData.title}
                  </h1>
                  <p className="text-lg sm:text-2xl font-semibold text-white text-balance">
                    {currentSlideData.subtitle}
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-white/95 max-w-xl mx-auto lg:mx-0 lg:ms-0 leading-relaxed drop-shadow-lg"
              >
                {currentSlideData.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href={currentSlideData.cta.href}
                  className="btn-secondary shadow-elegant-lg group"
                  aria-label={currentSlideData.cta.label}
                >
                  {currentSlideData.cta.label}
                  <ArrowLeftIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href={currentSlideData.ctaSecondary.href}
                  className="btn-glass group"
                  aria-label={currentSlideData.ctaSecondary.label}
                >
                  {currentSlideData.ctaSecondary.label}
                </Link>
              </motion.div>

              <HeroStats
                stats={currentSlideData.stats}
                labels={{ ...statLabels, ...currentSlideData.statLabels }}
                animated={statsAnimated}
              />
            </div>

            <div className="hidden lg:block relative">
              <div className="relative mx-auto w-full max-w-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="aspect-square rounded-full border border-white/20 bg-white/10 p-6 shadow-elegant-2xl backdrop-blur-md animate-float"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-linear-to-br from-white/20 to-white/5 text-center">
                    <span className="text-7xl xl:text-8xl mb-4">⚽</span>
                    <p className="text-2xl font-bold text-white drop-shadow-lg">
                      آکادمی فوتبال افشین پیروانی
                    </p>
                    <p className="text-white/90 mt-1 drop-shadow-lg">
                      تعالی از سال ۱۳۹۳
                    </p>
                  </div>
                </motion.div>

                {achievements.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                    className={`absolute ${item.position} glass-card rounded-2xl p-4 shadow-elegant-lg animate-float min-w-[140px}`}
                    style={{ animationDelay: `${index * 0.4}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}
                      >
                        {getIcon(item.icon, `h-5 w-5 ${item.color}`)}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-navy-900 persian-numbers drop-shadow-sm">
                          {item.number}
                        </p>
                        <p className="text-xs text-slate-600 drop-shadow-sm">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          )}

          {currentNews && <HeroNews article={currentNews} />}
          <HeroPagination
            slideCount={slides.length}
            newsSlides={newsSlides}
            currentSlide={currentSlide}
            currentNewsSlide={currentNewsSlide}
            onSlideChange={setCurrentSlide}
            onNewsChange={setCurrentNewsSlide}
            canAutoplay={canAutoplay}
            isAutoplayRunning={isAutoplayRunning}
            reducedMotion={reducedMotion}
            motionOverride={motionOverride}
            onMotionOverride={() => {
              setMotionOverride(true);
              setAutoplayPaused(false);
            }}
            onAutoplayPauseToggle={() =>
              setAutoplayPaused((paused) => !paused)
            }
          />
        </div>
      </div>
    </section>
  );
}
