import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store';
import { YIELD_KEYS, YIELD_META, type YieldKey } from '../types';

export function TopBar() {
  const heatmap = useStore((s) => s.heatmapYield);
  const setHeatmap = useStore((s) => s.setHeatmapYield);
  const leaderboardOpen = useStore((s) => s.leaderboardOpen);
  const setLeaderboardOpen = useStore((s) => s.setLeaderboardOpen);
  const [menuOpen, setMenuOpen] = useState(false);

  const heatmapOptions: { key: YieldKey | 'civScore' | 'none'; label: string; icon: string }[] = [
    { key: 'none', label: 'Default', icon: '🌐' },
    { key: 'civScore', label: 'Civ Score', icon: '👑' },
    ...YIELD_KEYS.map((k) => ({ key: k, label: YIELD_META[k].label, icon: YIELD_META[k].icon })),
  ];

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-3 sm:p-4">
        {/* Logo */}
        <div className="pointer-events-auto glass flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="text-lg sm:text-xl leading-none">🌍</div>
          <div>
            <div className="heading text-[14px] sm:text-[15px] leading-none">Civ Earth</div>
            <div className="hidden sm:block text-[11px] text-ink-muted leading-tight mt-0.5">The world as yields & wonders</div>
          </div>
        </div>

        {/* Desktop: color-by selector */}
        <div className="pointer-events-auto glass hidden sm:flex items-center gap-2 px-3 py-2">
          <span className="eyebrow">Color by</span>
          <select
            className="bg-surface-2 border border-line rounded-lg px-2 py-1 text-[13px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-civgold-ring/40"
            value={heatmap ?? 'none'}
            onChange={(e) => setHeatmap(e.target.value === 'none' ? null : (e.target.value as YieldKey | 'civScore'))}
          >
            {heatmapOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.icon} {o.label}</option>
            ))}
          </select>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {/* Desktop: rankings button */}
          <button
            className="btn-ghost hidden sm:inline-flex"
            onClick={() => setLeaderboardOpen(!leaderboardOpen)}
            aria-pressed={leaderboardOpen}
          >
            🏆 Rankings
          </button>

          {/* Mobile: hamburger */}
          <button
            className="sm:hidden glass px-3 py-2 text-ink"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute top-[60px] right-3 z-40 card p-4 min-w-[220px] space-y-3 sm:hidden"
          >
            <div>
              <div className="eyebrow mb-1.5">Color by</div>
              <select
                className="w-full bg-surface-3 border border-line rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink focus:outline-none"
                value={heatmap ?? 'none'}
                onChange={(e) => {
                  setHeatmap(e.target.value === 'none' ? null : (e.target.value as YieldKey | 'civScore'));
                  setMenuOpen(false);
                }}
              >
                {heatmapOptions.map((o) => (
                  <option key={o.key} value={o.key}>{o.icon} {o.label}</option>
                ))}
              </select>
            </div>
            <button
              className="w-full btn-ghost justify-center"
              onClick={() => { setLeaderboardOpen(!leaderboardOpen); setMenuOpen(false); }}
            >
              🏆 Rankings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
