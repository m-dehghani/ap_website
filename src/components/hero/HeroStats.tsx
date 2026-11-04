import { motion } from 'framer-motion';

export default function HeroStats({
  stats,
  labels,
  animated,
}: {
  stats: Record<string, string>;
  labels: Record<string, string>;
  animated: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="home-hero-stats mx-auto grid max-w-lg grid-cols-1 gap-2 pt-4 min-[375px]:grid-cols-2 min-[375px]:gap-3 sm:grid-cols-3 sm:gap-4 lg:mx-0"
    >
      {Object.entries(stats).map(([key, value]) => (
        <div
          key={key}
          className="min-w-0 rounded-2xl border border-white/15 bg-white/10 px-2 py-3 text-center backdrop-blur-sm min-[375px]:px-3 min-[375px]:py-4"
        >
          <div className="mb-1 break-words text-xl font-bold text-white persian-numbers tabular-nums min-[375px]:text-2xl sm:text-3xl">
            {animated ? value : '0'}
          </div>
          <div className="break-words text-[0.7rem] font-medium text-white/80 min-[375px]:text-xs sm:text-sm">
            {labels[key] ?? key}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
