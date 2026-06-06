import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import type { Country, YieldKey } from '../types';
import { YIELD_META } from '../types';
import { YIELD_DOCS } from '../lib/yieldDocs';
import { yieldSource } from '../lib/sources';

interface Props {
  country: Country;
  yieldKey: YieldKey | null;
  onClose: () => void;
}

export function YieldPopover({ country, yieldKey, onClose }: Props) {
  // ESC closes the popover
  useEffect(() => {
    if (!yieldKey) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [yieldKey, onClose]);

  return (
    <AnimatePresence>
      {yieldKey && (
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
            aria-labelledby="yield-popover-title"
          >
            <Body country={country} yieldKey={yieldKey} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Body({ country, yieldKey, onClose }: { country: Country; yieldKey: YieldKey; onClose: () => void }) {
  const y = country.yields[yieldKey];
  const meta = YIELD_META[yieldKey];
  const doc = YIELD_DOCS[yieldKey];
  const src = yieldSource(yieldKey, country);

  return (
    <>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-line/60">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none" aria-hidden>{meta.icon}</span>
          <div>
            <div id="yield-popover-title" className="heading text-[18px] leading-tight" style={{ color: meta.color }}>{meta.label}</div>
            <div className="text-[12px] text-ink-muted">{country.flag} {country.name}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl leading-none transition-colors" aria-label="Close">×</button>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-end justify-between gap-3 pb-3 border-b border-line/60">
          <div>
            <div className="eyebrow">This country</div>
            <div className="text-[20px] font-bold text-ink leading-tight">{y.display}</div>
            {y.detail && <div className="text-[11px] text-ink-muted mt-0.5 max-w-xs">{y.detail}</div>}
          </div>
          {y.rank !== undefined && y.percentile !== undefined && (
            <div className="text-right">
              <div className="eyebrow">Rank</div>
              <div className="text-[18px] font-bold text-ink tabular-nums leading-tight">#{y.rank}</div>
              <div className="text-[11px] text-ink-muted">{y.percentile}th percentile</div>
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow mb-1">What it measures</div>
          <p className="text-[13px] text-ink leading-relaxed">{doc.what}</p>
        </div>

        <div>
          <div className="eyebrow mb-1">How we score it</div>
          <p className="text-[13px] text-ink-muted leading-relaxed">{doc.indicator}</p>
        </div>

        <div>
          <div className="eyebrow mb-1">World context</div>
          <p className="text-[13px] text-ink-muted leading-relaxed">{doc.context}</p>
        </div>

        <div className="pt-2 border-t border-line/60">
          <a
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-civgold hover:opacity-80 transition-opacity"
          >
            Open {src.label} ↗
          </a>
        </div>
      </div>
    </>
  );
}
