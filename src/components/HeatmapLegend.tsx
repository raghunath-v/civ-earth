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
      const min = Math.min(...scores);
      const max = Math.max(...scores);
      const stops = Array.from({ length: 6 }, (_, i) => {
        const v = min + ((max - min) * i) / 5;
        const closest = countries.reduce((a, b) =>
          Math.abs((b.civScore ?? 0) - v) < Math.abs((a.civScore ?? 0) - v) ? b : a
        );
        return scale(closest.iso3);
      });
      return { label: '👑 Civ Score', stops };
    }
    const k = effective as YieldKey;
    const scale = makeYieldColorScale(countries, k);
    const sorted = [...countries].sort((a, b) => (a.yieldZ?.[k] ?? 0) - (b.yieldZ?.[k] ?? 0));
    const step = Math.max(1, Math.floor(sorted.length / 5));
    const stops = Array.from({ length: 6 }, (_, i) => {
      const c = sorted[Math.min(i * step, sorted.length - 1)];
      return scale(c.iso3);
    });
    return { label: `${YIELD_META[k].icon} ${YIELD_META[k].label}`, stops };
  }, [heatmap, countries]);

  // Build a CSS gradient string from the color stops
  const gradient = `linear-gradient(to right, ${meta.stops.join(', ')})`;

  return (
    <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-line/50 bg-surface-2/80 px-3 py-1.5"
         style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <span className="text-[11px] font-medium text-ink-muted whitespace-nowrap">{meta.label}</span>
      <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: gradient }} />
    </div>
  );
}
