import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { getIcon } from '@/lib/icons';
import type { NewsArticleViewModel } from '@/types/viewModels/content';

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  bgGradient: string;
  stats: Record<string, string>;
  statLabels?: Record<string, string>;
}

interface HeroAchievement {
  icon: string;
  number: string;
  label: string;
  color: string;
  bg: string;
  position: string;
}

interface HeroProps {
  slides: HeroSlide[];
  achievements: HeroAchievement[];
  statLabels: Record<string, string>;
  recentNews: NewsArticleViewModel[];
}

const PARTICLE_COLORS = [
  'rgba(239,68,68,0.6)',
  'rgba(249,115,22,0.6)',
  'rgba(255,255,255,0.45)',
];

function ParticleSystem({
  particleCount = 30,
  colors = PARTICLE_COLORS,
  reducedMotion,
}: {
  particleCount?: number;
  colors?: string[];
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      opacity: number;
    }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (
      !canvas ||
      reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [particleCount, colors, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

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
      className="relative min-h-[92vh] flex items-center overflow-hidden"
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
        } transition-all duration-1000`}
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-40 animate-gradient-shift" />
        <div className="absolute inset-0 bg-pattern-grid opacity-20" />
        <div className="absolute inset-0 bg-black/25" />
        <ParticleSystem
          particleCount={40}
          colors={PARTICLE_COLORS}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className="relative z-10 w-full">
        <div className="container-custom">
          {currentSlideData && (
          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 items-center min-h-[80vh] py-16 md:py-20">
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
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight text-balance"
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-3 gap-4 pt-4 max-w-lg mx-auto lg:mx-0"
              >
                {Object.entries(currentSlideData.stats).map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/15 bg-white/10 px-3 py-4 text-center backdrop-blur-sm"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-white persian-numbers mb-1">
                      {statsAnimated ? value : '0'}
                    </div>
                    <div className="text-xs sm:text-sm text-white/75 font-medium">
                      {currentSlideData.statLabels?.[key] ??
                        statLabels[key] ??
                        key}
                    </div>
                  </div>
                ))}
              </motion.div>
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

          {currentNews && (
            <div className="mx-auto max-w-6xl pb-8" aria-live="off">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-red-200">
                    تازه از آکادمی
                  </p>
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
                    key={currentNews.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group flex min-h-36 items-center gap-4 rounded-2xl border border-white/15 bg-white/95 p-4 text-right shadow-lg transition-transform hover:-translate-y-1 focus-visible:outline-white sm:gap-6 sm:p-6"
                  >
                  {currentNews.videoUrl ? (
                    <video
                      controls
                      playsInline
                      preload="none"
                      poster={currentNews.image ?? undefined}
                      aria-label={currentNews.title}
                      className="h-28 w-28 shrink-0 rounded-xl bg-black object-cover sm:h-36 sm:w-48"
                    >
                      <source src={currentNews.videoUrl} />
                      مرورگر شما از پخش ویدئو پشتیبانی نمی‌کند.
                    </video>
                  ) : currentNews.image &&
                    !currentNews.image.startsWith('/api/placeholder/') ? (
                    <Image
                      src={currentNews.image}
                      alt=""
                      width={192}
                      height={144}
                      unoptimized
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
                  <Link href="/news" className="min-w-0 focus-visible:underline">
                    <span className="mb-1 block text-xs font-medium text-primary-700">
                      {currentNews.type === 'VIDEO' ? 'ویدئو' : 'خبر'} ·{' '}
                      {currentNews.publishedAt.slice(0, 10)}
                    </span>
                    <span className="line-clamp-2 block text-base font-bold leading-7 text-slate-900 group-hover:text-primary-700 sm:text-xl">
                      {currentNews.title}
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm leading-6 text-slate-600 sm:text-base">
                      {currentNews.excerpt}
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center items-center gap-3 pb-10"
            role="group"
            aria-label="اسلایدهای هیرو"
          >
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={index === currentSlide}
                aria-label={`برو به اسلاید ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-8 h-3 bg-white'
                    : 'w-3 h-3 bg-white/40 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy-900'
                }`}
              />
            ))}
            {newsSlides.map((article, index) => (
              <button
                key={article.id}
                type="button"
                aria-pressed={index === currentNewsSlide}
                aria-label={`نمایش خبر ${index + 1}: ${article.title}`}
                onClick={() => setCurrentNewsSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentNewsSlide
                    ? 'w-8 h-3 bg-white'
                    : 'w-3 h-3 bg-white/40 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy-900'
                }`}
              />
            ))}
            {canAutoplay && (
              <button
                type="button"
                aria-label={
                  isAutoplayRunning ? 'توقف نمایش خودکار' : 'شروع نمایش خودکار'
                }
                aria-pressed={isAutoplayRunning}
                onClick={() => {
                  if (reducedMotion && !motionOverride) {
                    setMotionOverride(true);
                    setAutoplayPaused(false);
                  } else {
                    setAutoplayPaused((paused) => !paused);
                  }
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isAutoplayRunning ? (
                  <PauseIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <PlayIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
