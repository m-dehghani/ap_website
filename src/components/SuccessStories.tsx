import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { getIcon } from '@/lib/icons';
import { useAnimatedStat } from '@/hooks/useAnimatedStat';
import type {
  AnimatedStatisticViewModel,
  SuccessAchievementViewModel,
  SuccessMilestoneViewModel,
  SuccessTestimonialViewModel,
} from '@/types/viewModels/content';

type TabType = 'achievements' | 'testimonials' | 'statistics';

interface SuccessStoriesProps {
  stories: SuccessAchievementViewModel[];
  testimonials: SuccessTestimonialViewModel[];
  statistics: AnimatedStatisticViewModel[];
  milestones: SuccessMilestoneViewModel[];
}

function FilterChips({
  activeFilter,
  onFilterChange,
  filters,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: { id: string; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div
      className="flex flex-wrap justify-center gap-3 mb-8"
      role="group"
      aria-label="فیلتر داستان‌های موفقیت"
    >
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            activeFilter === filter.id
              ? 'bg-emerald-700 text-white shadow-lg'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
          }`}  
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={activeFilter === filter.id}
        >
          {filter.icon && <span>{filter.icon}</span>}
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
}

function AchievementCard({
  achievement,
  index,
}: {
  achievement: SuccessAchievementViewModel;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8" />
        </div>

        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <TrophyIcon className="w-7 h-7" />
          </div>
          <div className="text-left">
            <div className="text-sm opacity-90">{achievement.date}</div>
            <div className="text-xs opacity-75">{achievement.program}</div>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2 relative z-10">
          {achievement.playerName}
        </h3>
        <p className="text-emerald-100 text-sm relative z-10">
          {achievement.age} ساله
        </p>
      </div>

      <div className="p-6 space-y-4">
        <h4 className="text-lg font-bold text-gray-900">
          {achievement.achievement}
        </h4>
        <p className="text-gray-600 leading-relaxed">
          {achievement.description}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 relative">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-emerald-600 mb-2" />
          <p className="text-gray-700 italic text-sm">
            &ldquo;{achievement.quote}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <StatItem
            value={achievement.stats.goals}
            label="گل"
            icon={<TrophyIcon className="w-5 h-5" />}
            color="emerald"
          />
          <StatItem
            value={achievement.stats.assists}
            label="پاس گل"
            icon={<ArrowRightIcon className="w-5 h-5" />}
            color="emerald"
          />
          <StatItem
            value={achievement.stats.matches}
            label="بازی"
            icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
            color="emerald"
          />
        </div>

        <div className="text-sm pt-4 border-t border-gray-100">
          <span className="text-gray-500">مربی: {achievement.coach}</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({
  value,
  label,
  icon,
  color,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  color: 'emerald' | 'primary' | 'amber';
}) {
  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-50',
    primary: 'text-primary-600 bg-primary-50',
    amber: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="text-center">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-full flex items-center justify-center mx-auto mb-2`}>
        {icon}
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: SuccessTestimonialViewModel;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold ml-4">
          {testimonial.name.split(' ')[0].charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {testimonial.name}
          </h3>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
          <p className="text-xs text-emerald-700">{testimonial.program}</p>
        </div>
      </div>

      <div className="flex items-center mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="text-yellow-400"
          >
            <StarIcon className="w-5 h-5 fill-current" />
          </motion.span>
        ))}
      </div>

      <blockquote className="text-gray-700 leading-relaxed mb-6 italic relative">
        <span className="text-emerald-300 text-4xl absolute -top-2 -right-2">
          &ldquo;
        </span>
        <span className="relative z-10">"{testimonial.text}"</span>
      </blockquote>

      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
        <span className="text-gray-500">{testimonial.date}</span>
        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
          {testimonial.improvement}
        </span>
      </div>
    </motion.div>
  );
}

function StatisticCard({
  stat,
  index,
}: {
  stat: AnimatedStatisticViewModel;
  index: number;
}) {
  const { elementRef, displayValue } = useAnimatedStat(stat.number);

  const bgColors = [
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-purple-100',
  ];

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-lg p-8 text-center ${bgColors[index]}`}
    >
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        {getIcon(stat.icon, `w-8 h-8 ${stat.color}`)}
      </div>
      <motion.div className="text-4xl font-bold text-gray-900 mb-2">
        {displayValue}
      </motion.div>
      <div className="text-lg font-semibold text-gray-800 mb-2">
        {stat.label}
      </div>
      <p className="text-sm text-gray-600">{stat.description}</p>
    </motion.div>
  );
}

function TimelineItem({
  milestone,
  index,
}: {
  milestone: SuccessMilestoneViewModel;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl"
    >
      <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
        {milestone.year}
      </div>
      <div>
        <h4 className="font-bold text-emerald-700 mb-1">{milestone.event}</h4>
        <p className="text-gray-600 text-sm">{milestone.description}</p>
      </div>
    </motion.div>
  );
}

export default function SuccessStoriesComponent({ stories, testimonials, statistics, milestones }: SuccessStoriesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('achievements');
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [testimonialFilter, setTestimonialFilter] = useState('all');

  const achievementFilters = [
    { id: 'all', label: 'همه', icon: <TrophyIcon className="w-4 h-4" /> },
    ...Array.from(new Set(stories.map((a) => a.program))).map((p) => ({
      id: p,
      label: p,
      icon: <FunnelIcon className="w-4 h-4" />,
    })),
  ];

  const testimonialFilters = [
    {
      id: 'all',
      label: 'همه',
      icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
    },
    ...Array.from(new Set(testimonials.map((t) => t.program))).map((p) => ({
      id: p,
      label: p,
      icon: <FunnelIcon className="w-4 h-4" />,
    })),
  ];

  const filteredAchievements =
    achievementFilter === 'all'
      ? stories
      : stories.filter((a) => a.program === achievementFilter);

  const filteredTestimonials =
    testimonialFilter === 'all'
      ? testimonials
      : testimonials.filter((t) => t.program === testimonialFilter);

  return (
    <section className="py-20 bg-linear-to-br from-emerald-50 to-emerald-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-4">
            <TrophyIcon className="w-4 h-4 ml-2" />
            داستان‌های موفقیت
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            افتخارات <span className="text-emerald-600">دانش‌آموزان</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            بازیکنان ما در مسیر رسیدن به اهدافشان موفقیت‌های بزرگی کسب کرده‌اند
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white rounded-xl p-2 shadow-lg flex items-center gap-2" role="group" aria-label="دسته‌بندی داستان‌های موفقیت">
            {(['achievements', 'testimonials', 'statistics'] as TabType[]).map((tab) => (
              <motion.button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={activeTab === tab}
              >
                {tab === 'achievements' && <TrophyIcon className="w-4 h-4" />}
                {tab === 'testimonials' && <ChatBubbleLeftRightIcon className="w-4 h-4" />}
                {tab === 'statistics' && <StarIcon className="w-4 h-4" />}
                {tab === 'achievements' && 'دستاوردهای بزرگ'}
                {tab === 'testimonials' && 'نظرات و تجربیات'}
                {tab === 'statistics' && 'آمار موفقیت'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FilterChips
                activeFilter={achievementFilter}
                onFilterChange={setAchievementFilter}
                filters={achievementFilters}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredAchievements.map((achievement, index) => (
                  <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                ))}
              </div>
              {filteredAchievements.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  هیچ دستاوردی برای این فیلتر یافت نشد
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'testimonials' && (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FilterChips
                activeFilter={testimonialFilter}
                onFilterChange={setTestimonialFilter}
                filters={testimonialFilters}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTestimonials.map((testimonial, index) => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
                ))}
              </div>
              {filteredTestimonials.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  هیچ نظری برای این فیلتر یافت نشد
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {statistics.map((stat, index) => (
                  <StatisticCard key={index} stat={stat} index={index} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  مسیر موفقیت آکادمی افشین پیروانی
                </h3>
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <TimelineItem key={index} milestone={milestone} index={index} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}