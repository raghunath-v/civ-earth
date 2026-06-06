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
          transition={{ type: 'spring', stiffness: 250, damping: 28 }}
          className="absolute right-0 top-16 bottom-3 z-30 w-[420px] max-w-[90vw] p-3"
        >
          <div className="civ-panel h-full flex flex-col">
            <div className="flex items-center justify-between border-b-2 border-civ-border/40 px-4 py-2.5">
              <div className="civ-heading text-lg">🏆 Rankings</div>
              <button onClick={() => setOpen(false)} className="text-civ-ink/60 hover:text-civ-ink text-xl leading-none">×</button>
            </div>
            <div className="flex flex-wrap gap-1 border-b-2 border-civ-border/40 px-3 py-2">
              <TabBtn active={tab === 'civScore'} onClick={() => setTab('civScore')}>👑 Civ Score</TabBtn>
              {YIELD_KEYS.map((k) => (
                <TabBtn key={k} active={tab === k} onClick={() => setTab(k)}>
                  {YIELD_META[k].icon} {YIELD_META[k].label}
                </TabBtn>
              ))}
            </div>
            <div className="civ-scroll flex-1 overflow-y-auto px-3 py-2">
              <ol className="space-y-1">
                {ranked.map((c, i) => {
                  const val = tab === 'civScore' ? (c.civScore ?? 0) : c.yields[tab].value;
                  const display = tab === 'civScore' ? `${c.civScore ?? '—'}` : c.yields[tab].display;
                  const pct = (val / maxVal) * 100;
                  return (
                    <li key={c.iso3}>
                      <button
                        className="w-full text-left flex items-center gap-2 rounded-md border border-civ-border/30 bg-civ-parchment/60 hover:bg-civ-parchment px-2 py-1.5"
                        onClick={() => { setSelected(c.iso3); }}
                      >
                        <div className="w-7 text-center font-bold text-civ-ink/70 text-sm">{i + 1}</div>
                        <div className="text-xl leading-none">{c.flag}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-civ-ink truncate">{c.name}</div>
                          <div className="h-1.5 rounded bg-civ-border/20 overflow-hidden mt-0.5">
                            <div className="h-full rounded" style={{ width: `${pct}%`, background: tab === 'civScore' ? '#e0a82e' : YIELD_META[tab].color }} />
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-civ-ink/80 tabular-nums">{display}</div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="border-t border-civ-border/30 px-3 py-1.5 text-[10px] text-civ-ink/60">
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
      className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${active ? 'bg-civ-gold border-civ-border text-civ-ink' : 'bg-transparent border-civ-border/30 text-civ-ink/70 hover:bg-civ-parchment/60'}`}
    >
      {children}
    </button>
  );
}
