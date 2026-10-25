import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { ProgramViewModel } from '@/types/viewModels/program';
import { Schedule } from '@/types/domain/program';
import { formatToman, toPersianDigits } from '@/lib/format';
import { normalizeClubColorClasses } from '@/lib/brand-colors';

type ViewMode = 'detail' | 'compare';

interface ProgramCardProps {
  program: ProgramViewModel;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

function ProgramCard({ program, index, isSelected, onSelect }: ProgramCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -8, scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
      onClick={onSelect}
      className={`card-glass w-full p-6 rounded-4xl cursor-pointer text-right transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary-600 shadow-elegant-lg' : ''
      }`}
      aria-pressed={isSelected}
      aria-label={`انتخاب برنامه ${program.name}`}
    >
      {program.popular && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block"
        >
          محبوب‌ترین
        </motion.div>
      )}
      <div className="text-center">
        <motion.div
          className="text-4xl mb-4"
          whileHover={{ rotate: 180, scale: 1.2 }}
          transition={{ duration: 0.5 }}
        >
          {program.icon}
        </motion.div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h4>
        <p className="text-sm text-gray-600 mb-4">{program.ageRange}</p>
        <div className="text-xl font-bold text-primary-600 mb-2 persian-numbers">
          {formatToman(program.price)}
          <span className="text-sm text-gray-500 font-normal"> / {program.period}</span>
        </div>
        <div className="flex items-center justify-center mb-4">
          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 mr-1">{toPersianDigits(program.rating)}</span>
        </div>
        <div className="text-sm text-gray-500">
          {toPersianDigits(program.studentsEnrolled)} بازیکن • {program.level}
        </div>
      </div>
    </motion.button>
  );
}

function StatCard({
  value,
  label,
  icon,
  color = 'primary',
  index = 0
}: {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  color?: 'primary' | 'emerald' | 'amber' | 'secondary';
  index?: number;
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`p-6 rounded-2xl border ${colorClasses[color]} text-center`}
    >
      <motion.div
        className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
      >
        {icon}
      </motion.div>
      <div className="text-3xl font-bold text-gray-900 mb-1 persian-numbers">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}

function FeatureItem({ feature, index }: { feature: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <CheckCircleIcon className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
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
      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
    >
      <div className="flex items-center">
        <ClockIcon className="w-5 h-5 text-gray-400 mr-3" />
        <span className="font-semibold text-gray-900">{schedule.day}</span>
      </div>
      <span className="text-primary-700 font-bold persian-numbers">{schedule.time}</span>
    </motion.div>
  );
}

function CoachCard({ coach, program }: { coach: ProgramViewModel['coach']; program: ProgramViewModel }) {
  if (!coach) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glass p-8 rounded-4xl"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <UserGroupIcon className="w-6 h-6 text-primary-600" />
        مربی شما
      </h3>
      <div className="flex items-center space-x-6">
        <motion.div
          className="w-20 h-20 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
        >
          {coach.fullName.charAt(0)}
        </motion.div>
        <div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">{coach.fullName}</h4>
          {coach.title && <p className="text-gray-600 mb-2">{coach.title}</p>}
          <div className="flex items-center space-x-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(coach.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">امتیاز {toPersianDigits(coach.rating)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard value={coach.experience} label="سال تجربه" icon={<CalendarDaysIcon className="w-6 h-6" />} color="primary" />
        <StatCard value={coach.studentsCount} label="بازیکن آموزش‌دیده" icon={<UserGroupIcon className="w-6 h-6" />} color="emerald" />
        <StatCard value={program.level} label="سطح برنامه" icon={<ChartBarIcon className="w-6 h-6" />} color="amber" />
      </div>
    </motion.div>
  );
}

function EnrollmentCTA({ program }: { program: ProgramViewModel }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const enroll = async () => {
    setIsEnrolling(true);
    try {
      const response = await fetch('/api/student/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId: program.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'ثبت‌نام ناموفق بود');
      }
      toast.success('درخواست ثبت‌نام شما ارسال شد.');
      await router.push('/student/dashboard');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'ثبت‌نام ناموفق بود',
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-glass p-8 rounded-4xl bg-linear-to-br from-primary-50 to-primary-100 border border-primary-200 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-300 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-300 rounded-full translate-y-8 -translate-x-8" />
      </div>

      <div className="relative z-10 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">آماده پیوستن هستید؟</h3>
        <p className="text-gray-600 mb-6">سفر فوتبالی خود را با {program.name} شروع کنید!</p>
        {user?.role === 'STUDENT' ? (
          <button
            type="button"
            onClick={() => void enroll()}
            disabled={isEnrolling}
            className="w-full btn btn-primary shadow-elegant-lg inline-flex items-center justify-center disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex items-center justify-center">
              {isEnrolling ? 'در حال ثبت‌نام...' : `ثبت نام در ${program.name}`}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </span>
          </button>
        ) : (
          <Link
            href={`/register?program=${program.id}`}
            className="w-full btn btn-primary shadow-elegant-lg inline-flex items-center justify-center"
          >
            <span className="flex items-center justify-center">
              ثبت نام در {program.name}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </span>
          </Link>
        )}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4 text-red-500" />
            اولین جلسه رایگان
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            بدون هزینه ثبت نام
          </span>
          <span className="flex items-center gap-1">
            <CurrencyDollarIcon className="w-4 h-4 text-amber-500" />
            ضمانت بازگشت وجه
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonTable({ programs, selectedProgram }: { programs: ProgramViewModel[]; selectedProgram: number }) {
  const comparisonFields = [
    { key: 'name', label: 'نام برنامه', icon: TrophyIcon },
    { key: 'ageRange', label: 'محدوده سنی', icon: UserGroupIcon },
    { key: 'duration', label: 'مدت (ماه)', icon: CalendarDaysIcon },
    { key: 'sessionCount', label: 'تعداد جلسات', icon: ClockIcon },
    { key: 'maxStudents', label: 'حداکثر بازیکن', icon: UserGroupIcon },
    { key: 'level', label: 'سطح', icon: ChartBarIcon },
    { key: 'price', label: 'قیمت', icon: CurrencyDollarIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-x-auto rounded-2xl border border-gray-200 bg-white"
    >
      <table className="w-full text-right">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-4 font-bold text-gray-900">ویژگی</th>
            {programs.map((p, i) => (
              <th key={p.id} className={`p-4 font-bold text-center ${i === selectedProgram ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}`}>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span>{p.name}</span>
                  {p.popular && <span className="bg-accent-500 text-white px-2 py-0.5 rounded-full text-xs">محبوب</span>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFields.map((field, rowIndex) => (
            <tr key={field.key} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                <field.icon className="w-5 h-5 text-gray-400" />
                {field.label}
              </td>
              {programs.map((p, colIndex) => (
                <td key={p.id} className={`p-4 text-center ${colIndex === selectedProgram ? 'bg-primary-50' : ''}`}>
                  {field.key === 'name' && <span className="font-bold text-gray-900">{p.name}</span>}
                  {field.key === 'ageRange' && <span className="text-gray-700">{p.ageRange}</span>}
                  {field.key === 'duration' && <span className="text-gray-700 persian-numbers">{p.duration} ماه</span>}
                  {field.key === 'sessionCount' && <span className="text-gray-700 persian-numbers">{toPersianDigits(p.sessionCount)} جلسه</span>}
                  {field.key === 'maxStudents' && <span className="text-gray-700 persian-numbers">{toPersianDigits(p.maxStudents)} نفر</span>}
                  {field.key === 'level' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      p.level === 'مبتدی' ? 'bg-green-100 text-green-700' :
                      p.level === 'متوسط' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.level}
                    </span>
                  )}
                  {field.key === 'price' && <span className="font-bold text-primary-600 persian-numbers">{formatToman(p.price)}</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">برنامه‌ای یافت نشد</h3>
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 text-balance">
            مسیر <span className="gradient-text">تمرین خود</span> را انتخاب کنید
          </h1>
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
              className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-start"
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
                      className="absolute top-6 right-6 bg-accent-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      محبوب‌ترین
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-3xl font-bold mb-2">{currentProgram.name}</h3>
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
                      />
                      <StatCard
                        value={toPersianDigits(currentProgram.sessionCount)}
                        label="مجموع جلسات"
                        icon={<ClockIcon className="w-6 h-6" />}
                        color="primary"
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
