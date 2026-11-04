import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  StarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import ProfileAvatar from '@/components/ProfileAvatar';
import { toPersianDigits } from '@/lib/format';
import type { ProgramViewModel } from '@/types/viewModels/program';
import StatCard from '@/components/programs/StatCard';

export default function CoachCard({
  coach,
  program,
}: {
  coach: ProgramViewModel['coach'];
  program: ProgramViewModel;
}) {
  if (!coach) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glass rounded-4xl p-8"
    >
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
        <UserGroupIcon className="h-6 w-6 text-primary-600" />
        مربی شما
      </h2>
      <div className="flex items-center space-x-6">
        <motion.div className="h-20 w-20 shrink-0 rounded-2xl">
          <ProfileAvatar
            image={coach.image}
            initials={coach.fullName.trim().charAt(0)}
            size={80}
          />
        </motion.div>
        <div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            {coach.fullName}
          </h3>
          {coach.title && <p className="mb-2 text-gray-600">{coach.title}</p>}
          <div className="flex items-center space-x-3">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  className={`h-4 w-4 ${
                    index < Math.round(coach.rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              امتیاز {toPersianDigits(coach.rating)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard
          value={coach.experience}
          label="سال تجربه"
          icon={<CalendarDaysIcon className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          value={coach.studentsCount}
          label="بازیکن آموزش‌دیده"
          icon={<UserGroupIcon className="h-6 w-6" />}
          color="emerald"
        />
        <StatCard
          value={program.level}
          label="سطح برنامه"
          icon={<ChartBarIcon className="h-6 w-6" />}
          color="amber"
        />
      </div>
    </motion.div>
  );
}
