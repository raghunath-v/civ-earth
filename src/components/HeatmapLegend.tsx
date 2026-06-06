import { useMemo } from 'react';
import { useStore } from '../store';
import { YIELD_META, type YieldKey } from '../types';
import { makeYieldColorScale, makeCivScoreColorScale } from '../lib/colorScale';

export function HeatmapLegend() {
  const heatmap = useStore((s) => s.heatmapYield);
  const countries = useStore((s) => s.countries);

  const meta = useMemo(() => {
    const effective = heatmap ?? 'civScore';
    if (effective === 'civScore') {
      const scale = makeCivScoreColorScale(countries);
      const scores = countries.map((c) => c.civScore ?? 0);
      return {
        label: '👑 Civ Score',
        sample: scores.length ? Array.from({ length: 8 }, (_, i) => {
          const v = Math.min(...scores) + ((Math.max(...scores) - Math.min(...scores)) * i) / 7;
          const closest = countries.reduce((a, b) => (Math.abs((b.civScore ?? 0) - v) < Math.abs((a.civScore ?? 0) - v) ? b : a));
          return { v: Math.round(v), color: scale(closest.iso3) };
        }) : [],
      };
    }
    const k = effective as YieldKey;
    const scale = makeYieldColorScale(countries, k);
    const sorted = [...countries].sort((a, b) => (a.yieldZ?.[k] ?? 0) - (b.yieldZ?.[k] ?? 0));
    const step = Math.max(1, Math.floor(sorted.length / 7));
    return {
      label: `${YIELD_META[k].icon} ${YIELD_META[k].label}`,
      sample: Array.from({ length: 8 }, (_, i) => {
        const c = sorted[Math.min(i * step, sorted.length - 1)];
        return { v: c.yields[k].value, color: scale(c.iso3) };
      }),
    };
  }, [heatmap, countries]);

  if (!meta) return null;
  return (
    <div className="absolute bottom-4 left-4 z-30 glass px-3 py-2">
      <div className="eyebrow mb-1.5">
        Color by · <span className="text-ink-muted normal-case">{meta.label}</span>
        {!heatmap && <span className="ml-1 text-ink-subtle font-normal normal-case">(default)</span>}
      </div>
      <div className="flex items-center gap-0.5">
        {meta.sample.map((s, i) => (
          <div key={i} className="h-3.5 w-6 rounded-sm" style={{ background: s.color }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-medium text-ink-subtle">
        <span>lower</span>
        <span>higher</span>
      </div>
    </div>
  );
}
