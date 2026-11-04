import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { ProgramViewModel } from '@/types/viewModels/program';
import { Schedule } from '@/types/domain/program';
import { formatToman, toPersianDigits } from '@/lib/format';
import { normalizeClubColorClasses } from '@/lib/brand-colors';
import ComparisonTable from '@/components/programs/ComparisonTable';
import ProgramCard from '@/components/programs/ProgramCard';
import CoachCard from '@/components/programs/CoachCard';
import EnrollmentCTA from '@/components/programs/EnrollmentCTA';
import StatCard from '@/components/programs/StatCard';

export { ComparisonTable };

type ViewMode = 'detail' | 'compare';

function FeatureItem({ feature, index }: { feature: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-3 py-2"
    >
      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-growth-green" />
      <span className="text-gray-700 font-medium">{feature}</span>
    </motion.div>
  );
}

function ScheduleItem({ schedule, index }: { schedule: Schedule; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center justify-between gap-4 border-b border-slate-200 py-3 last:border-0"
    >
      <div className="flex items-center">
        <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
        <span className="font-semibold text-gray-900">{schedule.day}</span>
      </div>
      <span className="text-primary-700 font-bold persian-numbers tabular-nums">{schedule.time}</span>
    </motion.div>
  );
}

export default function Programs({ programs }: { programs: ProgramViewModel[] }) {
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState(() =>
    Math.max(0, programs.findIndex((p) => p.id === router.query.program))
  );
  const [viewMode, setViewMode] = useState<ViewMode>('detail');
  const [isAnimating, setIsAnimating] = useState(false);

  const currentProgram = programs[selectedProgram];

  const handleProgramSelect = useCallback((index: number) => {
    if (isAnimating || index === selectedProgram) return;
    setIsAnimating(true);
    setSelectedProgram(index);
    setTimeout(() => setIsAnimating(false), 300);
  }, [selectedProgram, isAnimating]);

  if (!currentProgram) {
    return (
      <section className="section-padding text-center text-gray-600">
        <div className="container-custom">
          <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">برنامه‌ای یافت نشد</h2>
          <p className="text-gray-500">در حال حاضر برنامه آموزشی فعالی وجود ندارد.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-linear-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-300 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-300 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent-300 rounded-full blur-3xl opacity-15 animate-blob" style={{ animationDelay: '4s' }} />
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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mb-6">
            <TrophyIcon className="w-4 h-4 mr-2" />
            برنامه‌های آموزشی
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 text-balance">
            مسیر <span className="text-club-red-deep">تمرین خود</span> را انتخاب کنید
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
            برنامه‌های حرفه‌ای برای هر سن و سطح مهارت، با مربیان متخصص و امکانات مدرن
          </p>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center gap-4 mb-12"
        >
          <motion.button
            onClick={() => setViewMode('detail')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              viewMode === 'detail'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            aria-pressed={viewMode === 'detail'}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            جزئیات برنامه
          </motion.button>
          <motion.button
            onClick={() => setViewMode('compare')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              viewMode === 'compare'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
            aria-pressed={viewMode === 'compare'}
          >
            <ChartBarIcon className="w-5 h-5" />
            مقایسه برنامه‌ها
          </motion.button>
        </motion.div>

        {/* Program Selection Tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
            role="group"
            aria-label="برنامه‌های آموزشی"
          >
            {programs.map((program: ProgramViewModel, index: number) => (
              <motion.button
                key={program.id}
                type="button"
                onClick={() => handleProgramSelect(index)}
                disabled={isAnimating}
                aria-pressed={selectedProgram === index}
                aria-label={`برنامه ${program.name}`}
                className={`relative group px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedProgram === index
                    ? 'bg-primary-600 text-white shadow-elegant-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-200'
                }`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {program.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center"
                  >
                    <SparklesIcon className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
                <div className="flex items-center space-x-3">
                  <motion.span
                    className="text-2xl"
                    whileHover={{ rotate: 180, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    {program.icon}
                  </motion.span>
                  <div className="text-left">
                    <div className="font-bold">{program.name}</div>
                    <div className={`text-sm ${selectedProgram === index ? 'text-primary-200' : 'text-gray-500'}`}>
                      {program.ageRange}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {viewMode === 'detail' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedProgram}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid items-start gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-14"
            >
              {/* Program Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
                className="space-y-8"
              >
                {/* Main Program Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`card-glass p-8 rounded-4xl bg-linear-to-br ${normalizeClubColorClasses(currentProgram.color)} text-white relative overflow-hidden`}
                >
                  {currentProgram.popular && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-5 inline-flex rounded-full bg-accent-700 px-3 py-1 text-sm font-medium text-white"
                    >
                      محبوب‌ترین
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="mb-2 break-words text-3xl font-bold">{currentProgram.name}</h3>
                        <p className="text-lg opacity-90">{currentProgram.ageRange}</p>
                      </div>
                      <motion.div
                        className="text-6xl"
                        whileHover={{ rotate: 180, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        {currentProgram.icon}
                      </motion.div>
                    </div>

                    <p className="text-lg opacity-90 mb-8 leading-relaxed">{currentProgram.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <StatCard
                        value={formatToman(currentProgram.price)}
                        label={`در هر ${currentProgram.period}`}
                        icon={<CurrencyDollarIcon className="w-6 h-6" />}
                        color="primary"
                        tone="inverse"
                      />
                      <StatCard
                        value={toPersianDigits(currentProgram.sessionCount)}
                        label="مجموع جلسات"
                        icon={<ClockIcon className="w-6 h-6" />}
                        color="primary"
                        tone="inverse"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0, scale: 0, rotate: -180 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              className={`w-4 h-4 ${i < Math.floor(currentProgram.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              <StarIcon className="w-4 h-4 fill-current" />
                            </motion.span>
                          ))}
                        </div>
                        <span className="text-sm opacity-90">امتیاز {toPersianDigits(currentProgram.rating)}</span>
                      </div>
                      <div className="text-sm opacity-80">
                        {toPersianDigits(currentProgram.studentsEnrolled)} بازیکن ثبت نام شده
                      </div>
                    </div>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                  </div>
                </motion.div>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="card-glass p-8 rounded-4xl"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <StarIcon className="w-6 h-6 text-primary-600" />
                    آنچه شامل می‌شود
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {currentProgram.features.map((feature: string, index: number) => (
                      <FeatureItem key={index} feature={feature} index={index} />
                    ))}
                  </div>
                </motion.div>

                {/* Program Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="card-glass p-8 rounded-4xl"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <AcademicCapIcon className="w-6 h-6 text-primary-600" />
                    جزئیات برنامه
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard value={`${toPersianDigits(currentProgram.duration)} ماه`} label="مدت برنامه" icon={<CalendarDaysIcon className="w-6 h-6" />} color="primary" />
                    <StatCard value={toPersianDigits(currentProgram.maxStudents)} label="حداکثر بازیکن" icon={<UserGroupIcon className="w-6 h-6" />} color="emerald" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Training Details */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
                className="space-y-8"
              >
                {/* Coach Information */}
                <CoachCard coach={currentProgram.coach} program={currentProgram} />

                {/* Schedule */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="card-glass p-8 rounded-4xl"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <CalendarDaysIcon className="w-6 h-6 text-primary-600" />
                    برنامه تمرینی
                  </h3>
                  <div className="space-y-3">
                    {currentProgram.schedule.map((value: Schedule, index: number) => (
                      <ScheduleItem key={value.id} schedule={value} index={index} />
                    ))}
                    {currentProgram.schedule.length === 0 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-500 text-center py-4"
                      >
                        برنامه زمانی به‌زودی اعلام می‌شود.
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* Enrollment CTA */}
                <EnrollmentCTA program={currentProgram} />
              </motion.div>
                            </motion.div>
          </AnimatePresence>
        )}

        {viewMode === 'compare' && (
          <AnimatePresence mode="wait">
            <motion.div
              key="compare"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
                  مقایسه همه برنامه‌ها
                </h3>
                <ComparisonTable programs={programs} selectedProgram={selectedProgram} />
              </motion.div>

              {/* All Programs Overview Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                                {programs.map((program: ProgramViewModel, index: number) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    index={index}
                    isSelected={selectedProgram === index}
                    onSelect={() => handleProgramSelect(index)}
                  />
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
