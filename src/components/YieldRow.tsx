import { useEffect, useState } from 'react';
import { YIELD_KEYS, YIELD_META, type Country, type YieldKey } from '../types';
import { Sparkline } from './Sparkline';
import { getTimeseries, type TimeseriesMap, type TimeSeries } from '../lib/timeseries';

// Map YieldKey → World Bank indicator key in timeseries.json
const INDICATOR_KEY: Partial<Record<YieldKey, string>> = {
  gold: 'gold',
  science: 'science',
  production: 'production',
  food: 'food',
  military: 'military',
  amenity: 'amenity',
  // culture + faith have no clean WB time-series → no sparkline
};

interface Props {
  country: Country;
  dense?: boolean;
  onYieldClick?: (k: YieldKey) => void;
}

export function YieldRow({ country, dense = false, onYieldClick }: Props) {
  const [tsData, setTsData] = useState<TimeseriesMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTimeseries().then((data) => { if (!cancelled) setTsData(data); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2">
      {YIELD_KEYS.map((k) => {
        const y = country.yields[k];
        const m = YIELD_META[k];
        const clickable = !!onYieldClick;
        const indKey = INDICATOR_KEY[k];
        const series: TimeSeries = indKey && tsData ? (tsData[country.iso3]?.[indKey] ?? []) : [];

        return (
          <button
            key={k}
            type="button"
            onClick={clickable ? () => onYieldClick!(k) : undefined}
            disabled={!clickable}
            className={`group min-w-0 text-left rounded-xl border border-line/70 bg-surface-3/60 px-2 py-2 flex flex-col transition-all duration-150 ease-apple ${clickable ? 'hover:bg-surface-3 hover:border-line cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
          >
            {/* Fixed-height label row — always at top */}
            <div className="flex items-center gap-1 leading-none h-4">
              <span className="text-[13px] leading-none">{m.icon}</span>
              <span
                className="text-[9px] font-semibold uppercase tracking-wide truncate"
                style={{ color: m.color }}
                title={m.label}
              >
                {m.label}
              </span>
            </div>
            {/* Value — fixed position below label */}
            <div className="mt-1.5 text-[12px] font-semibold text-ink leading-snug break-words min-h-[32px]">
              {y.display}
            </div>
            {/* Rank — always at same vertical position */}
            <div className="text-[10px] text-ink-subtle font-medium tabular-nums h-4">
              {y.rank !== undefined ? `#${y.rank} · ${y.percentile}th pct` : ''}
            </div>
            {/* Sparkline */}
            {!dense && series.length >= 3 && (
              <div className="mt-1.5">
                <Sparkline series={series} color={m.color} />
              </div>
            )}
            {/* Detail text */}
            {!dense && y.detail && (
              <div className="text-[10px] text-ink-muted leading-tight mt-1 break-words line-clamp-2">{y.detail}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
