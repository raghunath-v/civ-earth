import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store';
import { YIELD_KEYS, YIELD_META, type YieldKey } from '../types';

export function Leaderboard() {
  const open = useStore((s) => s.leaderboardOpen);
  const setOpen = useStore((s) => s.setLeaderboardOpen);
  const countries = useStore((s) => s.countries);
  const setSelected = useStore((s) => s.setSelected);
  const [tab, setTab] = useState<'civScore' | YieldKey>('civScore');

  const ranked = useMemo(() => {
    const list = [...countries];
    if (tab === 'civScore') {
      return list.sort((a, b) => (b.civScore ?? 0) - (a.civScore ?? 0)).slice(0, 15);
    }
    return list.sort((a, b) => b.yields[tab].value - a.yields[tab].value).slice(0, 15);
  }, [countries, tab]);

  const maxVal = ranked.length ? (tab === 'civScore' ? (ranked[0].civScore ?? 1) : ranked[0].yields[tab].value || 1) : 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 460, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 460, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          className="absolute right-0 top-0 sm:top-20 bottom-0 sm:bottom-4 z-30 w-full sm:w-[400px] sm:max-w-[92vw] sm:p-4"
        >
          <div className="glass h-full flex flex-col overflow-hidden sm:rounded-2xl rounded-none">
            <div className="flex items-center justify-between border-b border-line/60 px-5 py-3">
              <div className="heading text-[16px]">🏆 Rankings</div>
              <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink text-xl leading-none transition-colors" aria-label="Close">×</button>
            </div>
            <div className="flex flex-wrap gap-1 border-b border-line/60 px-4 py-2.5">
              <TabBtn active={tab === 'civScore'} onClick={() => setTab('civScore')}>👑 Civ Score</TabBtn>
              {YIELD_KEYS.map((k) => (
                <TabBtn key={k} active={tab === k} onClick={() => setTab(k)}>
                  {YIELD_META[k].icon} {YIELD_META[k].label}
                </TabBtn>
              ))}
            </div>
            <div className="scroll-y flex-1 overflow-y-auto px-3 py-2">
              <ol className="space-y-1">
                {ranked.map((c, i) => {
                  const val = tab === 'civScore' ? (c.civScore ?? 0) : c.yields[tab].value;
                  const display = tab === 'civScore' ? `${c.civScore ?? '—'}` : c.yields[tab].display;
                  const pct = (val / maxVal) * 100;
                  return (
                    <motion.li
                      key={c.iso3}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        className="w-full text-left flex items-center gap-2.5 rounded-xl border border-transparent hover:border-line/70 hover:bg-surface-3/60 px-2.5 py-1.5 transition-all duration-150 ease-apple active:scale-[0.99]"
                        onClick={() => { setSelected(c.iso3); }}
                      >
                        <div className="w-6 text-center font-semibold text-ink-muted text-[12px] tabular-nums">{i + 1}</div>
                        <div className="text-[18px] leading-none">{c.flag}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-ink truncate">{c.name}</div>
                          <div className="h-1 rounded-full bg-line/50 overflow-hidden mt-1">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: i * 0.03 + 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                              style={{ background: tab === 'civScore' ? '#d4a017' : YIELD_META[tab].color }}
                            />
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold text-ink-muted tabular-nums">{display}</div>
                      </button>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
            <div className="border-t border-line/60 px-4 py-2 text-[10px] text-ink-subtle">
              Top 15. Click a row to open the stat card.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all duration-150 ease-apple ${active ? 'bg-ink text-surface-2' : 'text-ink-muted hover:bg-surface-3'}`}
    >
      {children}
    </button>
  );
}
