import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { YIELD_KEYS, YIELD_META, type Country } from '../types';

export function CompareModal() {
  const show = useStore((s) => s.showCompareModal);
  const close = useStore((s) => s.closeCompareModal);
  const [aIso, bIso] = useStore((s) => s.compareSlots);
  const a = useStore((s) => (aIso ? s.byIso3[aIso] : null));
  const b = useStore((s) => (bIso ? s.byIso3[bIso] : null));
  const clearCompare = useStore((s) => s.clearCompare);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgb(0 0 0 / 0.45)', backdropFilter: 'blur(8px)' }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="card w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line/60 px-6 py-3.5">
              <div className="heading text-[17px]">Compare countries</div>
              <div className="flex items-center gap-2">
                {(aIso || bIso) && (
                  <button className="btn-ghost text-[12px]" onClick={clearCompare}>Clear all</button>
                )}
                <button className="btn-ghost" onClick={close}>Done</button>
              </div>
            </div>

            <div className="scroll-y flex-1 overflow-y-auto px-6 py-5">
              {/* Slot pickers */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                <SlotPicker slot={0} country={a} />
                <div className="text-xl font-light text-ink-subtle mt-6">vs</div>
                <SlotPicker slot={1} country={b} />
              </div>

              {/* Results — only shown when both slots filled */}
              {a && b && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 space-y-5"
                >
                  <ScoreRow a={a} b={b} />

                  <div>
                    <div className="eyebrow mb-2">Yields</div>
                    <div className="space-y-1.5">
                      {YIELD_KEYS.map((k) => {
                        const av = a.yields[k].value;
                        const bv = b.yields[k].value;
                        const aw = av >= bv;
                        const m = YIELD_META[k];
                        return (
                          <div key={k} className="grid grid-cols-[1fr_148px_1fr] gap-3 items-center">
                            <div className={`text-right text-[13px] ${aw ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
                              {a.yields[k].display}
                            </div>
                            <div className="flex items-center justify-center gap-1.5 rounded-full border border-line/70 bg-surface-3/50 px-2.5 py-1">
                              <span className="text-[14px]" style={{ color: m.color }}>{m.icon}</span>
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{m.label}</span>
                            </div>
                            <div className={`text-left text-[13px] ${!aw ? 'font-semibold text-ink' : 'text-ink-muted'}`}>
                              {b.yields[k].display}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="eyebrow mb-2">Civic indicators</div>
                    <CivicCompare a={a} b={b} />
                  </div>

                  <div>
                    <div className="eyebrow mb-2">Democracy indices</div>
                    <DemocracyCompare a={a} b={b} />
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {!a && !b && (
                <div className="mt-8 text-center text-[13px] text-ink-subtle">
                  <div className="text-3xl mb-3">⚔️</div>
                  <div className="font-medium text-ink-muted">Pick two countries to compare</div>
                  <div className="mt-1">Click the slots above to search and select</div>
                </div>
              )}
              {(a || b) && !(a && b) && (
                <div className="mt-8 text-center text-[13px] text-ink-subtle">
                  <div className="mt-1">Now pick the {a ? 'second' : 'first'} country →</div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Slot picker ─────────────────────────────────────────── */

function SlotPicker({ slot, country }: { slot: 0 | 1; country: Country | null }) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const countries = useStore((s) => s.countries);
  const setCompareSlot = useStore((s) => s.setCompareSlot);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries.slice(0, 8);
    return countries
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso3.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [countries, query]);

  const openSearch = () => {
    setSearching(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const pick = (iso3: string) => {
    setCompareSlot(slot, iso3);
    setSearching(false);
    setQuery('');
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareSlot(slot, null);
  };

  // ESC cancels search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSearching(false); setQuery(''); } };
    if (searching) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searching]);

  return (
    <div className="relative">
      {!searching ? (
        <button
          onClick={openSearch}
          className={`w-full text-left rounded-2xl border transition-all duration-150 ease-apple
            ${country
              ? 'border-line/70 bg-surface-3/50 hover:border-line hover:bg-surface-3'
              : 'border-dashed border-line bg-surface-3/30 hover:border-line/80 hover:bg-surface-3/50'
            } px-4 py-3 group`}
        >
          {country ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl leading-none">{country.flag}</span>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-ink truncate leading-tight">{country.name}</div>
                  <div className="text-[11px] text-ink-subtle">{country.era} era · Civ Score {country.civScore}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] text-ink-subtle group-hover:text-ink-muted transition-colors">change</span>
                <button
                  onClick={clear}
                  className="text-ink-subtle hover:text-ink transition-colors ml-1 text-base leading-none"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-ink-subtle py-1">
              <span className="text-[18px]">＋</span>
              <span className="text-[13px] font-medium">Pick a country</span>
            </div>
          )}
        </button>
      ) : (
        <div className="rounded-2xl border border-line bg-surface-2 shadow-pop overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line/60">
            <span className="text-ink-subtle text-[14px]">🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="flex-1 bg-transparent text-[13px] text-ink placeholder-ink-subtle outline-none"
            />
            <button
              onClick={() => { setSearching(false); setQuery(''); }}
              className="text-ink-subtle hover:text-ink text-base leading-none transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {results.map((c) => (
              <button
                key={c.iso3}
                onClick={() => pick(c.iso3)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-3/70 transition-colors"
              >
                <span className="text-[17px] leading-none">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">{c.name}</div>
                  <div className="text-[10px] text-ink-subtle">{c.era} era</div>
                </div>
                <div className="text-[11px] font-semibold text-ink-muted tabular-nums">{c.civScore}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Score row ───────────────────────────────────────────── */

function ScoreRow({ a, b }: { a: Country; b: Country }) {
  const aw = (a.civScore ?? 0) >= (b.civScore ?? 0);
  return (
    <div>
      <div className="eyebrow mb-2">Civ Score</div>
      <div className="grid grid-cols-[1fr_148px_1fr] gap-3 items-center">
        <div className={`text-right tabular-nums font-bold ${aw ? 'text-[28px] text-civgold' : 'text-[20px] text-ink-muted'}`}>{a.civScore}</div>
        <div className="text-center eyebrow">overall</div>
        <div className={`text-left tabular-nums font-bold ${!aw ? 'text-[28px] text-civgold' : 'text-[20px] text-ink-muted'}`}>{b.civScore}</div>
      </div>
    </div>
  );
}

function CivicCompare({ a, b }: { a: Country; b: Country }) {
  const items: [string, keyof Country['civics']][] = [
    ['Press Freedom', 'pressFreedom'],
    ['Anti-Corruption', 'antiCorruption'],
    ['Civil Liberties', 'civilLiberties'],
    ['Equality', 'equality'],
  ];
  return (
    <div className="space-y-1.5">
      {items.map(([label, k]) => {
        const av = a.civics[k];
        const bv = b.civics[k];
        const aw = av >= bv;
        return (
          <div key={label} className="grid grid-cols-[1fr_148px_1fr] gap-3 items-center text-[13px]">
            <div className={`text-right tabular-nums ${aw ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{av.toFixed(1)}/10</div>
            <div className="text-center eyebrow">{label}</div>
            <div className={`text-left tabular-nums ${!aw ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{bv.toFixed(1)}/10</div>
          </div>
        );
      })}
    </div>
  );
}

function DemocracyCompare({ a, b }: { a: Country; b: Country }) {
  const rows: [string, number | undefined, number | undefined, string][] = [
    ['V-Dem LDI', a.democracy.vdem, b.democracy.vdem, '0–1'],
    ['EIU Democracy', a.democracy.eiu, b.democracy.eiu, '0–10'],
    ['Freedom House', a.democracy.freedomHouseScore, b.democracy.freedomHouseScore, '0–100'],
    ['Polity5', a.democracy.polity5, b.democracy.polity5, '−10..10'],
  ];
  return (
    <div className="space-y-1 text-[13px]">
      {rows.map(([label, av, bv, unit]) => (
        <div key={label} className="grid grid-cols-[1fr_148px_1fr] gap-3 items-center">
          <div className="text-right tabular-nums text-ink-muted">{av !== undefined ? av : '—'}</div>
          <div className="text-center eyebrow">{label} <span className="text-ink-subtle normal-case font-normal">({unit})</span></div>
          <div className="text-left tabular-nums text-ink-muted">{bv !== undefined ? bv : '—'}</div>
        </div>
      ))}
    </div>
  );
}
