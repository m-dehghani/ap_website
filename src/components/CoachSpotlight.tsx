import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  TrophyIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { CoachViewModel } from '@/types/viewModels/coach';

interface CoachSpotlightProps {
  coaches?: CoachViewModel[];
}

export default function CoachSpotlight({ coaches = [] }: CoachSpotlightProps) {
  const [currentCoach, setCurrentCoach] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const coachTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const nextCoach = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentCoach((prev) => (prev + 1) % coaches.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [coaches.length, isAnimating]);

  const prevCoach = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentCoach((prev) => (prev - 1 + coaches.length) % coaches.length);
    setTimeout(() => setIsAnimating(false), 500);
  }, [coaches.length, isAnimating]);

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowLeft') nextIndex = (index + 1) % coaches.length;
    if (event.key === 'ArrowRight') {
      nextIndex = (index - 1 + coaches.length) % coaches.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = coaches.length - 1;

    if (nextIndex !== undefined) {
      event.preventDefault();
      setCurrentCoach(nextIndex);
      coachTabRefs.current[nextIndex]?.focus();
    }
  };

  if (!coaches || coaches.length === 0) return null;

  const coach = coaches[currentCoach];

  if (!coach) return null;

  return (
    <section
      className="section-padding bg-linear-to-br from-slate-50 to-slate-100 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-300 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mb-4">
            <UserGroupIcon className="w-4 h-4 ml-2" />
            تیم مربیگری
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            مربیان <span className="text-primary-600">حرفه‌ای</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            تیم مربیگری ما از بهترین و باتجربه‌ترین مربیان کشور تشکیل شده است
          </p>
        </motion.div>

        {/* Coach Showcase */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCoach}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid lg:grid-cols-2 gap-12 items-center"
              id="coach-panel"
              role="tabpanel"
              aria-labelledby={`coach-tab-${currentCoach}`}
              tabIndex={0}
            >
              {/* Coach Image & Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-300 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary-300 rounded-full translate-y-12 -translate-x-12" />
                  </div>

                  <div className="relative z-10 text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2,
                      }}
                      className="w-48 h-48 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-6xl font-bold mx-auto mb-6 shadow-elegant-xl"
                    >
                      {coach.firstName.split(' ')[0].charAt(0)}
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="text-3xl font-bold text-gray-900 mb-2"
                    >
                      {coach.firstName} {coach.lastName}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="text-lg text-primary-600 font-medium mb-2"
                    >
                      {coach.title}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      className="text-gray-600"
                    >
                      {coach.specialization}
                    </motion.p>
                  </div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="grid grid-cols-3 gap-4 mb-8"
                  >
                    <StatCard
                      value={coach.experience.toString()}
                      label="سال تجربه"
                      icon={<CalendarDaysIcon className="w-6 h-6" />}
                      color="primary"
                    />
                    <StatCard
                      value={coach.studentsCount.toString()}
                      label="دانش‌آموز"
                      icon={<UserGroupIcon className="w-6 h-6" />}
                      color="emerald"
                    />
                    <StatCard
                      value={coach.rating.toString()}
                      label="امتیاز"
                      icon={<StarIcon className="w-6 h-6 fill-current" />}
                      color="amber"
                    />
                  </motion.div>

                  {/* Quote */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-gray-50 rounded-xl p-6 text-center relative"
                  >
                    <div className="text-4xl text-primary-600 mb-4">
                      &ldquo;
                    </div>
                    <p className="text-gray-700 italic text-lg leading-relaxed relative z-10">
                      {coach.quote}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Coach Details */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Bio */}
                <DetailCard
                  title="معرفی مربی"
                  icon={<UserGroupIcon className="w-5 h-5 text-primary-600" />}
                >
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {coach.bio}
                  </p>

                  {/* Social Media */}
                  <div className="flex space-x-4 space-x-reverse">
                    {coach.instagram && (
                      <motion.a
                        href={`https://instagram.com/${coach.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-shadow flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919 4.92-.058-1.265-.07-1.644-.07-4.849 0 3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919 4.919-1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0 3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        {coach.instagram}
                      </motion.a>
                    )}
                    {coach.twitter && (
                      <motion.a
                        href={`https://twitter.com/${coach.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-linear-to-r from-primary-500 to-primary-700 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-shadow flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                        {coach.twitter}
                      </motion.a>
                    )}
                  </div>
                </DetailCard>

                {/* Certifications */}
                <DetailCard
                  title="مدارک و گواهینامه‌ها"
                  icon={
                    <AcademicCapIcon className="w-5 h-5 text-primary-600" />
                  }
                >
                  <div className="space-y-3">
                    {coach.certifications.map((cert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        whileHover={{ x: 8 }}
                      >
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 ml-3 shrink-0" />
                        <span className="text-gray-700">{cert}</span>
                      </motion.div>
                    ))}
                  </div>
                </DetailCard>

                {/* Achievements */}
                <DetailCard
                  title="افتخارات و دستاوردها"
                  icon={<TrophyIcon className="w-5 h-5 text-primary-600" />}
                >
                  <div className="space-y-3">
                    {coach.achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                        whileHover={{ x: 8 }}
                      >
                        <TrophyIcon className="w-5 h-5 text-emerald-600 ml-3 shrink-0" />
                        <span className="text-gray-700">{achievement}</span>
                      </motion.div>
                    ))}
                  </div>
                </DetailCard>

                {/* Programs */}
                <DetailCard
                  title="برنامه‌های تدریس"
                  icon={
                    <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                  }
                >
                  <div className="flex flex-wrap gap-2">
                    {coach.programs.map((program, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-linear-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-full text-sm"
                      >
                        {program.name}
                      </motion.span>
                    ))}
                  </div>
                </DetailCard>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center items-center mt-12 space-x-4 space-x-reverse"
            aria-label="مربیان"
          >
            <motion.button
              onClick={prevCoach}
              disabled={isAnimating}
              className="bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="مربی قبلی"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </motion.button>

            <div
              className="flex space-x-2"
              role="tablist"
              aria-orientation="horizontal"
              aria-label="نمایش مربیان"
            >
              {coaches.map((_, index) => (
                <motion.button
                  key={index}
                  type="button"
                  ref={(element) => {
                    coachTabRefs.current[index] = element;
                  }}
                  onClick={() => setCurrentCoach(index)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  id={`coach-tab-${index}`}
                  role="tab"
                  aria-controls="coach-panel"
                  aria-selected={index === currentCoach}
                  tabIndex={index === currentCoach ? 0 : -1}
                  aria-label={`مربی ${index + 1}`}
                  className={`w-12 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    index === currentCoach
                      ? 'bg-primary-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              onClick={nextCoach}
              disabled={isAnimating}
              className="bg-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="مربی بعدی"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        {/* All Coaches Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            تمام مربیان ما
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coaches.map((coachItem, index) => (
              <motion.button
                key={coachItem.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => setCurrentCoach(index)}
                className={`w-full bg-white rounded-2xl p-6 shadow-lg cursor-pointer text-center transition-all hover:shadow-xl ${
                  index === currentCoach ? 'ring-2 ring-primary-600' : ''
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={index === currentCoach}
                aria-label={`انتخاب مربی ${coachItem.firstName} ${coachItem.lastName}`}
              >
                <div className="text-center">
                  <motion.div
                    className="w-20 h-20 bg-linear-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                    whileHover={{ rotate: 180, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {coachItem.firstName.split(' ')[0].charAt(0)}
                  </motion.div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {coachItem.firstName} {coachItem.lastName}
                  </h4>
                  <p className="text-sm text-primary-600 mb-2">
                    {coachItem.title}
                  </p>
                  <div className="flex items-center justify-center mb-2">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 mr-1">
                      {coachItem.rating}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {coachItem.experience} سال تجربه
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Stat Card Component
function StatCard({
  value,
  label,
  icon,
  color,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: 'primary' | 'emerald' | 'amber';
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className={`text-center p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center justify-center mb-2">
        <span
          className={colorClasses[color]
            .replace('bg-', 'text-')
            .replace('50', '600')}
        >
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Detail Card Component
function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        {icon}
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
