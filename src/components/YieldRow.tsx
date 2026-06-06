import { YIELD_KEYS, YIELD_META, type Country } from '../types';
import { yieldSource } from '../lib/sources';
import { SrcLink } from './SrcLink';

export function YieldRow({ country, dense = false }: { country: Country; dense?: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {YIELD_KEYS.map((k) => {
        const y = country.yields[k];
        const m = YIELD_META[k];
        const src = yieldSource(k, country);
        return (
          <div key={k} className="min-w-0 rounded-md border border-civ-border/40 bg-civ-parchment/60 px-1.5 py-1.5">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[13px]">{m.icon}</span>
              <span
                className="text-[9px] font-bold uppercase tracking-tight truncate"
                style={{ color: m.color }}
                title={m.label}
              >
                {m.label}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-civ-ink leading-snug break-words">
              {y.display}
              <SrcLink url={src.url} label={src.label} />
            </div>
            {!dense && y.detail && (
              <div className="text-[9px] text-civ-ink/60 leading-tight mt-0.5 break-words">{y.detail}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
