import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function StatCard({
  value,
  label,
  icon,
  color = 'primary',
  tone = 'default',
  index = 0,
}: {
  value: string | number;
  label: string;
  icon: ReactNode;
  color?: 'primary' | 'emerald' | 'amber' | 'secondary';
  tone?: 'default' | 'inverse';
  index?: number;
}) {
  const colorClasses = {
    primary: 'text-primary-700',
    emerald: 'text-accent-700',
    amber: 'text-gold-700',
    secondary: 'text-secondary-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="min-w-0 text-center"
    >
      <motion.div
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center ${colorClasses[color]}`}
      >
        {icon}
      </motion.div>
      <div
        className={`program-stat-value mb-1 min-w-0 break-words text-xl font-bold persian-numbers tabular-nums sm:text-2xl ${
          tone === 'inverse' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </div>
      <div className={`text-sm ${tone === 'inverse' ? 'text-white/85' : 'text-gray-600'}`}>
        {label}
      </div>
    </motion.div>
  );
}
