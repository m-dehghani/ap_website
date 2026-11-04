import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowRightIcon,
  CurrencyDollarIcon,
  HeartIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import type { ProgramViewModel } from '@/types/viewModels/program';

export default function EnrollmentCTA({
  program,
}: {
  program: ProgramViewModel;
}) {
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
      className="card-glass relative overflow-hidden rounded-4xl border border-primary-200 bg-linear-to-br from-primary-50 to-primary-100 p-8"
    >
      <div className="absolute inset-0 opacity-5">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-primary-300" />
        <div className="absolute bottom-0 left-0 h-16 w-16 -translate-x-8 translate-y-8 rounded-full bg-primary-300" />
      </div>

      <div className="relative z-10 text-center">
        <h3 className="mb-4 text-2xl font-bold text-gray-900">
          آماده پیوستن هستید؟
        </h3>
        <p className="mb-6 text-gray-600">
          سفر فوتبالی خود را با {program.name} شروع کنید!
        </p>
        {user?.role === 'STUDENT' ? (
          <button
            type="button"
            onClick={() => void enroll()}
            disabled={isEnrolling}
            className="btn btn-primary inline-flex w-full items-center justify-center shadow-elegant-lg disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex items-center justify-center">
              {isEnrolling ? 'در حال ثبت‌نام...' : `ثبت نام در ${program.name}`}
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </span>
          </button>
        ) : (
          <Link
            href={`/register?program=${program.id}`}
            className="btn btn-primary inline-flex w-full items-center justify-center shadow-elegant-lg"
          >
            <span className="flex items-center justify-center">
              ثبت نام در {program.name}
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </span>
          </Link>
        )}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <HeartIcon className="h-4 w-4 text-club-red" />
            اولین جلسه رایگان
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheckIcon className="h-4 w-4 text-growth-green" />
            بدون هزینه ثبت نام
          </span>
          <span className="flex items-center gap-1">
            <CurrencyDollarIcon className="h-4 w-4 text-achievement-gold" />
            ضمانت بازگشت وجه
          </span>
        </div>
      </div>
    </motion.div>
  );
}
