import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store';
import { YIELD_KEYS, YIELD_META, type YieldKey } from '../types';
import { openCommandPalette } from './CommandPalette';

function GlobeMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="10" stroke="#d4a017" strokeWidth="1.6" />
      {/* Central meridian ellipse */}
      <ellipse cx="12" cy="12" rx="4.2" ry="10" stroke="#d4a017" strokeWidth="1.6" />
      {/* Equator */}
      <path d="M2 12h20" stroke="#d4a017" strokeWidth="1.6" />
      {/* Upper latitude */}
      <path d="M4.6 7.2a16.4 16.4 0 0 0 14.8 0" stroke="#d4a017" strokeWidth="1" opacity="0.45" />
      {/* Lower latitude */}
      <path d="M4.6 16.8a16.4 16.4 0 0 1 14.8 0" stroke="#d4a017" strokeWidth="1" opacity="0.45" />
    </svg>
  );
}

export function TopBar() {
  const heatmap = useStore((s) => s.heatmapYield);
  const setHeatmap = useStore((s) => s.setHeatmapYield);
  const leaderboardOpen = useStore((s) => s.leaderboardOpen);
  const setLeaderboardOpen = useStore((s) => s.setLeaderboardOpen);
  const openCompareModal = useStore((s) => s.openCompareModal);
  const [menuOpen, setMenuOpen] = useState(false);

  const heatmapOptions: { key: YieldKey | 'civScore' | 'none'; label: string; icon: string }[] = [
    { key: 'none', label: 'Default', icon: '🌐' },
    { key: 'civScore', label: 'Civ Score', icon: '👑' },
    ...YIELD_KEYS.map((k) => ({ key: k, label: YIELD_META[k].label, icon: YIELD_META[k].icon })),
  ];

  return (
    <>
      {/* 3-column grid so center is always truly centered */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 grid grid-cols-3 items-start p-3 sm:p-4 gap-3">

        {/* ── Left: Logotype ── */}
        <div className="flex items-start">
          <div className="pointer-events-auto glass flex items-center gap-2.5 pl-3 pr-4 py-2.5">
            <GlobeMark size={22} />
            <div className="leading-none select-none">
              <div className="text-[15px] tracking-tight">
                <span className="font-bold text-ink">Civ</span>
                <span className="font-light text-ink-muted">Earth</span>
              </div>
              <div className="hidden sm:block text-[10px] text-ink-subtle mt-0.5 tracking-wide font-medium uppercase">
                Real world · Civ lens
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Color by (truly centered) ── */}
        <div className="flex justify-center">
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
        </div>

        {/* ── Right: Action buttons ── */}
        <div className="flex justify-end items-start gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              className="btn-ghost hidden sm:inline-flex"
              onClick={openCommandPalette}
              aria-label="Search (⌘K)"
              title="Search countries (⌘K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <kbd className="ml-1 rounded border border-line/70 bg-surface-3/70 px-1 py-0.5 text-[10px] font-semibold text-ink-subtle">⌘K</kbd>
            </button>
            <button className="btn-ghost hidden sm:inline-flex" onClick={openCompareModal} title="Compare two countries">
              ⚔️ Compare
            </button>
            <button
              className="btn-ghost hidden sm:inline-flex"
              onClick={() => setLeaderboardOpen(!leaderboardOpen)}
              aria-pressed={leaderboardOpen}
            >
              🏆 Rankings
            </button>
            <button
              className="sm:hidden glass px-3 py-2 text-ink font-medium"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute top-[60px] right-3 z-40 card p-4 min-w-[230px] space-y-3 sm:hidden"
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
            <button className="w-full btn-ghost justify-center" onClick={() => { openCommandPalette(); setMenuOpen(false); }}>
              🔍 Search
            </button>
            <button className="w-full btn-ghost justify-center" onClick={() => { openCompareModal(); setMenuOpen(false); }}>
              ⚔️ Compare
            </button>
            <button className="w-full btn-ghost justify-center" onClick={() => { setLeaderboardOpen(!leaderboardOpen); setMenuOpen(false); }}>
              🏆 Rankings
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
