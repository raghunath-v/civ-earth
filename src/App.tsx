import { useEffect, useMemo } from 'react';
import { useStore } from './store';
import { WorldMap } from './components/WorldMap';
import { TopBar } from './components/TopBar';
import { StatCard } from './components/StatCard';
import { CompareModal } from './components/CompareModal';
import { Leaderboard } from './components/Leaderboard';
import { HeatmapLegend } from './components/HeatmapLegend';
import { CommandPalette } from './components/CommandPalette';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { computeCivScores } from './lib/civScore';
import { COUNTRIES } from './data/countries';
import { parseHash, writeHash } from './lib/urlSync';
import type { YieldKey } from './types';

export default function App() {
  const setCountries = useStore((s) => s.setCountries);
  const initialized = useStore((s) => s.countries.length > 0);
  const byIso3 = useStore((s) => s.byIso3);

  // Boot: compute scores, populate store
  useMemo(() => {
    const withScores = computeCivScores(COUNTRIES);
    setCountries(withScores);
  }, [setCountries]);

  // On mount: parse URL hash → restore state
  const setSelected = useStore((s) => s.setSelected);
  const addToCompare = useStore((s) => s.addToCompare);
  const setHeatmapYield = useStore((s) => s.setHeatmapYield);

  useEffect(() => {
    if (!initialized) return;
    const { iso3, compare, yield: yieldKey } = parseHash();
    if (iso3 && byIso3[iso3]) setSelected(iso3);
    if (compare && byIso3[compare]) addToCompare(compare);
    if (yieldKey) setHeatmapYield(yieldKey as YieldKey | 'civScore');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // Sync state → URL hash whenever selection/compare/heatmap changes
  const selectedIso3 = useStore((s) => s.selectedIso3);
  const compareSlots = useStore((s) => s.compareSlots);
  const heatmapYield = useStore((s) => s.heatmapYield);

  useEffect(() => {
    writeHash(selectedIso3, compareSlots, heatmapYield);
  }, [selectedIso3, compareSlots, heatmapYield]);

  // Handle browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const { iso3, compare, yield: yieldKey } = parseHash();
      setSelected(iso3 && byIso3[iso3] ? iso3 : null);
      if (compare && byIso3[compare]) addToCompare(compare);
      setHeatmapYield(yieldKey as YieldKey | 'civScore' | null);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [byIso3, setSelected, addToCompare, setHeatmapYield]);

  if (!initialized) return <LoadingSkeleton />;

  return (
    <div className="relative h-full w-full overflow-hidden bg-ocean-deep">
      <WorldMap />
      <TopBar />
      <HeatmapLegend />
      <StatCard />
      <Leaderboard />
      <CompareModal />
      <CommandPalette />
    </div>
  );
}
