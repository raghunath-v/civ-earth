import { AnimatePresence, motion } from 'framer-motion';
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
      {show && a && b && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="civ-panel w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-civ-border/40 px-5 py-3">
              <div className="civ-heading text-xl">⚔️ Versus</div>
              <div className="flex items-center gap-2">
                <button className="civ-btn-ghost" onClick={clearCompare}>Clear</button>
                <button className="civ-btn-ghost" onClick={close}>Close</button>
              </div>
            </div>
            <div className="civ-scroll flex-1 overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <Side country={a} />
                <div className="text-3xl font-bold text-civ-ink/60">vs</div>
                <Side country={b} />
              </div>

              <div className="mt-5 civ-heading text-sm mb-2">Civ Score</div>
              <ScoreRow a={a} b={b} />

              <div className="mt-4 civ-heading text-sm mb-2">Yields head-to-head</div>
              <div className="space-y-1.5">
                {YIELD_KEYS.map((k) => {
                  const av = a.yields[k].value;
                  const bv = b.yields[k].value;
                  const aw = av >= bv;
                  const m = YIELD_META[k];
                  return (
                    <div key={k} className="grid grid-cols-[1fr_120px_1fr] gap-2 items-center">
                      <div className={`text-right ${aw ? 'font-bold' : 'text-civ-ink/60'}`}>
                        <div className="text-sm">{a.yields[k].display}</div>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 rounded border-2 border-civ-border/40 bg-civ-parchment/50 px-2 py-1">
                        <span className="text-lg" style={{ color: m.color }}>{m.icon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
                      </div>
                      <div className={`text-left ${!aw ? 'font-bold' : 'text-civ-ink/60'}`}>
                        <div className="text-sm">{b.yields[k].display}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 civ-heading text-sm mb-2">Civics</div>
              <CivicCompare a={a} b={b} />

              <div className="mt-5 civ-heading text-sm mb-2">Democracy indices</div>
              <DemocracyCompare a={a} b={b} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Side({ country }: { country: Country }) {
  return (
    <div className="rounded-lg border-2 border-civ-border bg-civ-parchment/50 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className="text-2xl">{country.flag}</div>
        <div>
          <div className="civ-heading text-base leading-tight">{country.name}</div>
          <div className="text-[11px] text-civ-ink/70">{country.era} era · {country.region}</div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ a, b }: { a: Country; b: Country }) {
  const aw = (a.civScore ?? 0) >= (b.civScore ?? 0);
  return (
    <div className="grid grid-cols-[1fr_120px_1fr] gap-2 items-center">
      <div className={`text-right ${aw ? 'font-display text-3xl font-bold text-civ-gold' : 'text-civ-ink/60 text-xl'}`}>{a.civScore}</div>
      <div className="text-center text-[10px] font-bold uppercase tracking-wider text-civ-ink/70">overall</div>
      <div className={`text-left ${!aw ? 'font-display text-3xl font-bold text-civ-gold' : 'text-civ-ink/60 text-xl'}`}>{b.civScore}</div>
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
          <div key={label} className="grid grid-cols-[1fr_140px_1fr] gap-2 items-center text-sm">
            <div className={`text-right ${aw ? 'font-bold' : 'text-civ-ink/60'}`}>{av.toFixed(1)}/10</div>
            <div className="text-center text-[10px] font-bold uppercase tracking-wider text-civ-ink/70">{label}</div>
            <div className={`text-left ${!aw ? 'font-bold' : 'text-civ-ink/60'}`}>{bv.toFixed(1)}/10</div>
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
    ['Polity5', a.democracy.polity5, b.democracy.polity5, '-10..10'],
  ];
  return (
    <div className="space-y-1 text-sm">
      {rows.map(([label, av, bv, unit]) => (
        <div key={label} className="grid grid-cols-[1fr_140px_1fr] gap-2 items-center">
          <div className="text-right text-civ-ink/80">{av !== undefined ? av : '—'}</div>
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-civ-ink/70">{label} <span className="text-civ-ink/40">({unit})</span></div>
          <div className="text-left text-civ-ink/80">{bv !== undefined ? bv : '—'}</div>
        </div>
      ))}
    </div>
  );
}
