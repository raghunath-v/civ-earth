import { useStore } from '../store';
import { YIELD_KEYS, YIELD_META, type YieldKey } from '../types';

export function TopBar() {
  const heatmap = useStore((s) => s.heatmapYield);
  const setHeatmap = useStore((s) => s.setHeatmapYield);
  const leaderboardOpen = useStore((s) => s.leaderboardOpen);
  const setLeaderboardOpen = useStore((s) => s.setLeaderboardOpen);

  const heatmapOptions: { key: YieldKey | 'civScore' | 'none'; label: string; icon: string }[] = [
    { key: 'none', label: 'Default', icon: '🌐' },
    { key: 'civScore', label: 'Civ Score', icon: '👑' },
    ...YIELD_KEYS.map((k) => ({ key: k, label: YIELD_META[k].label, icon: YIELD_META[k].icon })),
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3">
      <div className="pointer-events-auto civ-panel flex items-center gap-3 px-4 py-2">
        <div className="text-2xl">🌍</div>
        <div>
          <div className="civ-heading text-lg leading-none">Civ Earth</div>
          <div className="text-[10px] text-civ-ink/60 leading-tight">The world as yields & wonders</div>
        </div>
      </div>

      <div className="pointer-events-auto civ-panel flex items-center gap-2 px-3 py-2">
        <span className="civ-heading text-xs">Color by</span>
        <select
          className="bg-civ-paper border-2 border-civ-border rounded-md px-2 py-1 text-sm font-semibold text-civ-ink"
          value={heatmap ?? 'none'}
          onChange={(e) => setHeatmap(e.target.value === 'none' ? null : (e.target.value as YieldKey | 'civScore'))}
        >
          {heatmapOptions.map((o) => (
            <option key={o.key} value={o.key}>{o.icon} {o.label}</option>
          ))}
        </select>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          className="civ-btn"
          onClick={() => setLeaderboardOpen(!leaderboardOpen)}
        >
          🏆 Rankings
        </button>
      </div>
    </div>
  );
}
