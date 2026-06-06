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
            className={`group min-w-0 text-left rounded-xl border border-line/70 bg-surface-3/60 px-2 py-2 transition-all duration-150 ease-apple ${clickable ? 'hover:bg-surface-3 hover:border-line cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[13px]">{m.icon}</span>
              <span
                className="text-[9px] font-semibold uppercase tracking-wide truncate"
                style={{ color: m.color }}
                title={m.label}
              >
                {m.label}
              </span>
            </div>
            <div className="mt-1 text-[12px] font-semibold text-ink leading-snug break-words">
              {y.display}
            </div>
            {y.rank !== undefined && (
              <div className="text-[10px] text-ink-subtle font-medium mt-0.5 tabular-nums">
                #{y.rank} · {y.percentile}th pct
              </div>
            )}
            {!dense && series.length >= 3 && (
              <div className="mt-1.5">
                <Sparkline series={series} color={m.color} />
              </div>
            )}
            {!dense && y.detail && (
              <div className="text-[10px] text-ink-muted leading-tight mt-0.5 break-words line-clamp-2">{y.detail}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
