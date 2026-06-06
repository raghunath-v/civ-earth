import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import type { Country } from '../types';
import { ERA_ORDER } from '../lib/era';
import { useStore } from '../store';
import { SOURCE_LINKS } from '../lib/sources';

interface Props {
  country: Country | null;
  onClose: () => void;
}

/** HDI bracket thresholds matching `eraFromHdi`. */
const ERA_RANGES: { era: string; min: number; max: number }[] = [
  { era: 'Information', min: 0.95, max: 1.00 },
  { era: 'Atomic',      min: 0.90, max: 0.95 },
  { era: 'Modern',      min: 0.80, max: 0.90 },
  { era: 'Industrial',  min: 0.70, max: 0.80 },
  { era: 'Renaissance', min: 0.60, max: 0.70 },
  { era: 'Medieval',    min: 0.50, max: 0.60 },
  { era: 'Classical',   min: 0.40, max: 0.50 },
  { era: 'Antiquity',   min: 0.00, max: 0.40 },
];

export function EraPopover({ country, onClose }: Props) {
  const allCountries = useStore((s) => s.countries);

  useEffect(() => {
    if (!country) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [country, onClose]);

  const neighbors = useMemo(() => {
    if (!country) return { sameEra: [], nextEra: [] };
    const sameEra = allCountries
      .filter((c) => c.iso3 !== country.iso3 && c.era === country.era)
      .sort((a, b) => Math.abs(a.hdi - country.hdi) - Math.abs(b.hdi - country.hdi))
      .slice(0, 4);
    const nextEraName = ERA_ORDER[Math.min(ERA_ORDER.indexOf(country.era) + 1, ERA_ORDER.length - 1)];
    const nextEra = nextEraName === country.era
      ? []
      : allCountries
          .filter((c) => c.era === nextEraName)
          .sort((a, b) => a.hdi - b.hdi)
          .slice(0, 3);
    return { sameEra, nextEra };
  }, [country, allCountries]);

  return (
    <AnimatePresence>
      {country && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgb(0 0 0 / 0.45)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="card max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <Body country={country} onClose={onClose} sameEra={neighbors.sameEra} nextEra={neighbors.nextEra} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Body({ country, onClose, sameEra, nextEra }: { country: Country; onClose: () => void; sameEra: Country[]; nextEra: Country[] }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-line/60">
        <div>
          <div className="heading text-[18px] leading-tight">{country.era} era</div>
          <div className="text-[12px] text-ink-muted">{country.flag} {country.name} · HDI {country.hdi.toFixed(3)}</div>
        </div>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl leading-none transition-colors" aria-label="Close">×</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        <p className="text-[13px] text-ink leading-relaxed">
          Era is derived from the country's <a className="underline decoration-line decoration-1 underline-offset-2 hover:text-civgold hover:decoration-civgold transition-colors" href={SOURCE_LINKS.hdi(country).url} target="_blank" rel="noopener noreferrer">Human Development Index</a> (UNDP) — a composite of life expectancy, education, and income. Each era covers an HDI band.
        </p>

        <div>
          <div className="eyebrow mb-2">HDI ladder</div>
          <div className="space-y-1">
            {ERA_RANGES.map((r) => {
              const isCurrent = r.era === country.era;
              const next = ERA_ORDER.indexOf(country.era) + 1 < ERA_ORDER.length && ERA_ORDER[ERA_ORDER.indexOf(country.era) + 1] === r.era;
              return (
                <div
                  key={r.era}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${isCurrent ? 'bg-civgold-bg border border-civgold-ring/40' : 'border border-transparent'}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[13px] ${isCurrent ? 'font-bold text-ink' : 'text-ink-muted'}`}>{r.era}</span>
                    {isCurrent && <span className="text-[10px] font-semibold text-civgold-ring uppercase tracking-wide">you are here</span>}
                    {next && <span className="text-[10px] font-medium text-ink-subtle uppercase tracking-wide">next</span>}
                  </div>
                  <div className="text-[11px] text-ink-muted tabular-nums">
                    HDI {r.min === 0 ? '< ' : `${r.min.toFixed(2)}–`}{r.max === 1 ? '1.00' : r.max.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sameEra.length > 0 && (
          <div>
            <div className="eyebrow mb-1.5">Closest neighbors (same era)</div>
            <div className="flex flex-wrap gap-1.5 text-[12px]">
              {sameEra.map((c) => (
                <span key={c.iso3} className="chip">{c.flag} {c.name} · {c.hdi.toFixed(3)}</span>
              ))}
            </div>
          </div>
        )}

        {nextEra.length > 0 && (
          <div>
            <div className="eyebrow mb-1.5">Just into the next era</div>
            <div className="flex flex-wrap gap-1.5 text-[12px]">
              {nextEra.map((c) => (
                <span key={c.iso3} className="chip">{c.flag} {c.name} · {c.hdi.toFixed(3)}</span>
              ))}
            </div>
          </div>
        )}

        <p className="pt-2 border-t border-line/60 text-[11px] text-ink-subtle leading-relaxed">
          We use HDI tiers, not GDP. A wealthy country with poor life expectancy or education can have a lower era than its income suggests; the opposite also happens.
        </p>
      </div>
    </>
  );
}

