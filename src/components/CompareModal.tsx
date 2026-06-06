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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgb(0 0 0 / 0.45)', backdropFilter: 'blur(6px)' }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="card w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[92vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line/60 px-6 py-3.5">
              <div className="heading text-[18px]">⚔️ Versus</div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost" onClick={clearCompare}>Clear</button>
                <button className="btn-ghost" onClick={close}>Close</button>
              </div>
            </div>
            <div className="scroll-y flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <Side country={a} />
                <div className="text-2xl font-bold text-ink-subtle">vs</div>
                <Side country={b} />
              </div>

              <div className="mt-6 eyebrow mb-2">Civ Score</div>
              <ScoreRow a={a} b={b} />

              <div className="mt-5 eyebrow mb-2">Yields head-to-head</div>
              <div className="space-y-1.5">
                {YIELD_KEYS.map((k) => {
                  const av = a.yields[k].value;
                  const bv = b.yields[k].value;
                  const aw = av >= bv;
                  const m = YIELD_META[k];
                  return (
                    <div key={k} className="grid grid-cols-[1fr_140px_1fr] gap-3 items-center">
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

              <div className="mt-6 eyebrow mb-2">Civics</div>
              <CivicCompare a={a} b={b} />

              <div className="mt-6 eyebrow mb-2">Democracy indices</div>
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
    <div className="rounded-2xl border border-line/70 bg-surface-3/50 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="text-2xl">{country.flag}</div>
        <div>
          <div className="heading text-[16px] leading-tight">{country.name}</div>
          <div className="text-[11px] text-ink-muted">{country.era} era · {country.region}</div>
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ a, b }: { a: Country; b: Country }) {
  const aw = (a.civScore ?? 0) >= (b.civScore ?? 0);
  return (
    <div className="grid grid-cols-[1fr_140px_1fr] gap-3 items-center">
      <div className={`text-right tabular-nums ${aw ? 'text-[30px] font-bold text-civgold' : 'text-[20px] text-ink-muted'}`}>{a.civScore}</div>
      <div className="text-center eyebrow">overall</div>
      <div className={`text-left tabular-nums ${!aw ? 'text-[30px] font-bold text-civgold' : 'text-[20px] text-ink-muted'}`}>{b.civScore}</div>
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
          <div key={label} className="grid grid-cols-[1fr_140px_1fr] gap-3 items-center text-[13px]">
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
    ['Polity5', a.democracy.polity5, b.democracy.polity5, '-10..10'],
  ];
  return (
    <div className="space-y-1 text-[13px]">
      {rows.map(([label, av, bv, unit]) => (
        <div key={label} className="grid grid-cols-[1fr_140px_1fr] gap-3 items-center">
          <div className="text-right tabular-nums text-ink-muted">{av !== undefined ? av : '—'}</div>
          <div className="text-center eyebrow">{label} <span className="text-ink-subtle normal-case">({unit})</span></div>
          <div className="text-left tabular-nums text-ink-muted">{bv !== undefined ? bv : '—'}</div>
        </div>
      ))}
    </div>
  );
}
