import { motion } from 'framer-motion';

/** Full-viewport loading state shown before countries data is ready. */
export function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-ocean-deep gap-6">
      {/* Pulsing globe */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[56px] leading-none select-none"
      >
        🌍
      </motion.div>

      {/* Wordmark shimmer */}
      <div className="text-center space-y-1">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="text-surface-2 text-[22px] font-semibold tracking-tight"
        >
          Civ Earth
        </motion.div>
        <div className="text-ink-subtle text-[13px]">Loading the world…</div>
      </div>

      {/* Animated progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-surface-2/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
