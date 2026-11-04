import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { formatToman, toPersianDigits } from '@/lib/format';
import type { ProgramViewModel } from '@/types/viewModels/program';

interface ProgramCardProps {
  program: ProgramViewModel;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ProgramCard({
  program,
  index,
  isSelected,
  onSelect,
}: ProgramCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
      onClick={onSelect}
      className={`card-glass w-full cursor-pointer rounded-4xl p-6 text-right transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary-600 shadow-elegant-lg' : ''
      }`}
      aria-pressed={isSelected}
      aria-label={`انتخاب برنامه ${program.name}`}
    >
      {program.popular && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 inline-block rounded-full bg-accent-700 px-3 py-1 text-sm font-medium text-white"
        >
          محبوب‌ترین
        </motion.div>
      )}
      <div className="text-center">
        <motion.div
          className="mb-4 text-4xl"
          whileHover={{ rotate: 180, scale: 1.2 }}
          transition={{ duration: 0.5 }}
        >
          {program.icon}
        </motion.div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">{program.name}</h3>
        <p className="mb-4 text-sm text-gray-600">{program.ageRange}</p>
        <div className="persian-numbers mb-2 text-xl font-bold text-primary-600">
          {formatToman(program.price)}
          <span className="mr-1 text-sm font-normal text-gray-500">
            / {program.period}
          </span>
        </div>
        <div className="mb-4 flex items-center justify-center">
          <StarIcon className="h-4 w-4 fill-current text-yellow-400" />
          <span className="mr-1 text-sm text-gray-600">
            {toPersianDigits(program.rating)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {toPersianDigits(program.studentsEnrolled)} بازیکن • {program.level}
        </div>
      </div>
    </motion.button>
  );
}
