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
  const viewMode = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);
  const [menuOpen, setMenuOpen] = useState(false);

  const heatmapOptions: { key: YieldKey | 'civScore' | 'none'; label: string; icon: string }[] = [
    { key: 'none', label: 'Default', icon: '🌐' },
    { key: 'civScore', label: 'Civ Score', icon: '👑' },
    ...YIELD_KEYS.map((k) => ({ key: k, label: YIELD_META[k].label, icon: YIELD_META[k].icon })),
  ];

  return (
    <>
      {/* 3-column grid so center is always truly centered.
          Every element shares h-10 (40px) for visually balanced chrome. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center p-3 sm:p-4 gap-3">

        {/* ── Left: Logotype ── */}
        <div className="flex justify-start">
          <div className="pointer-events-auto glass inline-flex items-center gap-2 h-10 px-3.5">
            <GlobeMark size={20} />
            <div className="text-[15px] tracking-tight leading-none select-none whitespace-nowrap">
              <span className="font-bold text-ink">Civ</span>
              <span className="font-light text-ink-muted ml-0.5">Earth</span>
            </div>
          </div>
        </div>

        {/* ── Center: Color by + View toggle ── */}
        <div className="flex justify-center">
          <div className="pointer-events-auto glass hidden sm:inline-flex items-center gap-3 h-10 px-3">
            <div className="flex items-center gap-2">
              <span className="eyebrow">Show</span>
              <select
                className="bg-surface-2 border border-line rounded-lg px-2 h-7 text-[13px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-civgold-ring/40"
                value={heatmap ?? 'none'}
                onChange={(e) => setHeatmap(e.target.value === 'none' ? null : (e.target.value as YieldKey | 'civScore'))}
              >
                {heatmapOptions.map((o) => (
                  <option key={o.key} value={o.key}>{o.icon} {o.label}</option>
                ))}
              </select>
            </div>
            <div className="h-5 w-px bg-line/60" />
            <div className="inline-flex items-center rounded-lg border border-line bg-surface-2 h-7 p-0.5">
              <button
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center justify-center h-full w-8 rounded-md text-[14px] transition-colors duration-150 ${viewMode === 'map' ? 'bg-ink text-surface-2' : 'text-ink-muted hover:text-ink'}`}
                aria-pressed={viewMode === 'map'}
                aria-label="Map view"
                title="Map view"
              >
                🗺️
              </button>
              <button
                onClick={() => setViewMode('globe')}
                className={`inline-flex items-center justify-center h-full w-8 rounded-md text-[14px] transition-colors duration-150 ${viewMode === 'globe' ? 'bg-ink text-surface-2' : 'text-ink-muted hover:text-ink'}`}
                aria-pressed={viewMode === 'globe'}
                aria-label="Globe view"
                title="Globe view"
              >
                🌐
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Action buttons (icons + labels at lg+, icons-only between sm and lg) ── */}
        <div className="flex justify-end items-center gap-2">
          <button
            className="btn-ghost hidden sm:inline-flex pointer-events-auto"
            onClick={openCommandPalette}
            aria-label="Search countries"
            title="Search countries (⌘K)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="hidden lg:inline">Search</span>
          </button>
          <button
            className="btn-ghost hidden sm:inline-flex pointer-events-auto"
            onClick={openCompareModal}
            aria-label="Compare countries"
            title="Compare two countries"
          >
            <span>⚔️</span>
            <span className="hidden lg:inline">Compare</span>
          </button>
          <button
            className="btn-ghost hidden sm:inline-flex pointer-events-auto"
            onClick={() => setLeaderboardOpen(!leaderboardOpen)}
            aria-pressed={leaderboardOpen}
            aria-label="Rankings"
            title="Rankings"
          >
            <span>🏆</span>
            <span className="hidden lg:inline">Rankings</span>
          </button>
          <button
            className="sm:hidden pointer-events-auto glass inline-flex items-center justify-center h-10 w-10 text-ink font-medium"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
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
              <div className="eyebrow mb-1.5">View</div>
              <div className="flex items-center rounded-lg border border-line bg-surface-3 p-0.5">
                <button
                  onClick={() => { setViewMode('map'); setMenuOpen(false); }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors ${viewMode === 'map' ? 'bg-ink text-surface-2' : 'text-ink-muted'}`}
                >
                  🗺️ <span>Map</span>
                </button>
                <button
                  onClick={() => { setViewMode('globe'); setMenuOpen(false); }}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors ${viewMode === 'globe' ? 'bg-ink text-surface-2' : 'text-ink-muted'}`}
                >
                  🌐 <span>Globe</span>
                </button>
              </div>
            </div>
            <div>
              <div className="eyebrow mb-1.5">Show</div>
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
