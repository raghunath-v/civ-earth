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
          // Use any country with that civScore to color — just use mid-range with a fake lookup
          const closest = countries.reduce((a, b) => (Math.abs((b.civScore ?? 0) - v) < Math.abs((a.civScore ?? 0) - v) ? b : a));
          return { v: Math.round(v), color: scale(closest.iso3) };
        }) : [],
        unit: '',
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
        return { v: c.yields[k].value, color: scale(c.iso3), label: c.flag };
      }),
      unit: '',
    };
  }, [heatmap, countries]);

  if (!meta) return null;
  return (
    <div className="absolute bottom-3 left-3 z-30 civ-panel px-3 py-2">
      <div className="civ-heading text-xs mb-1">
        Color by · {meta.label}
        {!heatmap && <span className="ml-1 text-civ-ink/50 font-normal normal-case">(default)</span>}
      </div>
      <div className="flex items-center gap-0.5">
        {meta.sample.map((s, i) => (
          <div key={i} className="h-4 w-6" style={{ background: s.color }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-civ-ink/70">
        <span>lower</span>
        <span>higher</span>
      </div>
    </div>
  );
}
