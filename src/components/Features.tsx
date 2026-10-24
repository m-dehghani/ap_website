import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getIcon } from '@/lib/icons';
import { useAnimatedStat } from '@/hooks/useAnimatedStat';
import type {
  AnimatedStatisticViewModel,
  FeatureViewModel,
} from '@/types/viewModels/content';

interface FeaturesProps {
  features: FeatureViewModel[];
  stats: AnimatedStatisticViewModel[];
}

function FeatureCard3D({
  feature,
  index,
  isExpanded,
  onToggle,
}: {
  feature: FeatureViewModel;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      setMousePosition({ x: rotateY, y: rotateX });
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative perspective-1000"
      style={{
        transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <div className="relative h-full">
        <motion.div
          className="card-glass p-8 h-full relative z-10 overflow-hidden"
          animate={{
            boxShadow: isExpanded
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transform: isExpanded
              ? 'translateY(-8px) scale(1.02)'
              : 'translateY(0)',
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="mb-6"
            animate={{ scale: isExpanded ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center relative overflow-hidden`}
            >
              <motion.div
                animate={{
                  rotate: isExpanded ? 360 : 0,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: isExpanded ? 0.6 : 0,
                  repeat: isExpanded ? Infinity : 0,
                }}
              >
                {getIcon(feature.icon, feature.iconColor)}
              </motion.div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0"
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isExpanded && (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                    {feature.stats}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )}
            {isExpanded && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <span className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                    {feature.stats}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <h4 className="font-semibold text-gray-900">مزایای کلیدی:</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      مربیان مجرب و متخصص
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      برنامه‌های شخصی‌سازی‌شده
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      امکانات و تجهیزات مدرن
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      پیگیری پیشرفت مداوم
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className={`absolute inset-0 bg-linear-to-r ${feature.color} rounded-2xl`}
            animate={{ opacity: isExpanded ? 0.15 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <motion.button
          onClick={onToggle}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 shadow-lg hover:bg-white transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isExpanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}
        >
          {isExpanded ? 'بستن' : 'جزئیات بیشتر'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function AnimatedStat({
  stat,
  index,
}: {
  stat: AnimatedStatisticViewModel;
  index: number;
}) {
  const { elementRef, displayValue } = useAnimatedStat(stat.number);

  return (
    <motion.div
      ref={elementRef}
      className="text-center group"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div
        className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4"
        whileHover={{ scale: 1.1, rotate: 180 }}
        transition={{ duration: 0.5 }}
      >
        {getIcon(stat.icon, 'w-8 h-8 text-white')}
      </motion.div>
      <motion.div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {displayValue}
      </motion.div>
      <div className="text-primary-100 text-sm md:text-base font-medium">
        {stat.label}
      </div>
    </motion.div>
  );
}

const FeaturesComponent: React.FC<FeaturesProps> = ({ features, stats }) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section className="section-padding bg-linear-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkYzI2MjYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-rotate-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-300 rounded-full blur-3xl opacity-20 animate-blob" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-300 rounded-full blur-3xl opacity-20 animate-blob"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent-300 rounded-full blur-3xl opacity-15 animate-blob"
          style={{ animationDelay: '4s' }}
        />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4 ml-2" />
            چرا آکادمی AP
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 text-balance">
            چرا{' '}
            <span className="gradient-text">آکادمی فوتبال افشین پیروانی</span>{' '}
            را انتخاب کنیم؟
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto text-pretty">
            ما آموزش جامع فوتبال را با مربیان متخصص، امکانات مدرن و محیط حمایتی
            ارائه می‌دهیم که برای کمک به بازیکنان جهت رسیدن به حداکثر پتانسیل
            خود طراحی شده است.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <FeatureCard3D
              key={index}
              feature={feature}
              index={index}
              isExpanded={expandedCard === index}
              onToggle={() =>
                setExpandedCard(expandedCard === index ? null : index)
              }
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-20"
        >
          <div className="bg-linear-to-r from-primary-600 to-primary-700 rounded-4xl p-8 md:p-12 text-white shadow-elegant-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  دستاوردهای ما
                </h3>
                <p className="text-primary-100 max-w-2xl mx-auto text-lg">
                  اعدادی که نشان‌دهنده تعهد ما به تعالی و رشد بازیکنان است
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <AnimatedStat key={index} stat={stat} index={index} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="relative"
              whileInView={{ y: [50, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-video rounded-4xl overflow-hidden shadow-elegant-xl relative">
                <motion.img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="Football Training"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent rounded-4xl" />

                <motion.div
                  className="absolute top-6 right-6 glass-card p-4 rounded-xl"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-white persian-numbers">
                    ۴.۹/۵
                  </div>
                  <div className="text-white/80 text-sm">رضایت بازیکنان</div>
                </motion.div>

                <motion.div
                  className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">تمرین رایگان</p>
                      <p className="text-sm text-gray-500">
                        جلسه اول بدون هزینه
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
                  تجربه‌ای متفاوت در آموزش فوتبال
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  آکادمی فوتبال افشین پیروانی روش‌های علمی تمرین را با رویکردهای
                  نوین ترکیب می‌کند تا بهترین آموزش فوتبال را ارائه دهد — از
                  مهارت‌های پایه تا آمادگی حرفه‌ای.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: 'RocketLaunchIcon',
                    title: 'آموزش هدفمند',
                    description:
                      'برنامه‌های ساختاریافته با اهداف مشخص و پیشرفت قابل اندازه‌گیری.',
                  },
                  {
                    icon: 'HeartIcon',
                    title: 'توجه فردی',
                    description:
                      'مربیگری شخصی‌سازی‌شده تا هر بازیکن پشتیبانی اختصاصی دریافت کند.',
                  },
                  {
                    icon: 'CogIcon',
                    title: 'روحیه تیمی',
                    description:
                      'تقویت همکاری و مهارت‌های کار گروهی در زمین و خارج از آن.',
                  },
                  {
                    icon: 'SparklesIcon',
                    title: 'استاندارد بالا',
                    description:
                      'استانداردهای آموزشی بین‌المللی برای آمادگی رقابتی.',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all"
                    whileHover={{ x: 8 }}
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      {getIcon(feature.icon, 'h-5 w-5 text-primary-600')}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-6">
                <motion.a
                  href="/about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center"
                >
                  بیشتر درباره آکادمی فوتبال افشین پیروانی بدانید
                  <SparklesIcon className="w-5 h-5 ml-2" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-linear-to-r from-secondary-50 to-secondary-100 rounded-4xl p-12 border border-secondary-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-300 rounded-full -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-300 rounded-full translate-y-12 -translate-x-12" />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-200 mb-4">
                آماده شروع سفر فوتبال خود هستید؟
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                به صدها بازیکنی بپیوندید که با آموزش حرفه‌ای، بازی خود را متحول
                کرده‌اند.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="/register"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  همین امروز شروع کنید
                </motion.a>
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-outline"
                >
                  رزرو بازدید
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesComponent;
