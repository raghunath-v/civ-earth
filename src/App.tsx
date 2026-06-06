import { useMemo } from 'react';
import { useStore } from './store';
import { WorldMap } from './components/WorldMap';
import { TopBar } from './components/TopBar';
import { StatCard } from './components/StatCard';
import { CompareModal } from './components/CompareModal';
import { Leaderboard } from './components/Leaderboard';
import { HeatmapLegend } from './components/HeatmapLegend';
import { computeCivScores } from './lib/civScore';
import { COUNTRIES } from './data/countries';

export default function App() {
  const setCountries = useStore((s) => s.setCountries);
  const initialized = useStore((s) => s.countries.length > 0);

  useMemo(() => {
    const withScores = computeCivScores(COUNTRIES);
    setCountries(withScores);
  }, [setCountries]);

  if (!initialized) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-civ-oceanDeep text-civ-parchment">
        <div className="civ-heading text-2xl">Loading the world…</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-civ-oceanDeep">
      <WorldMap />
      <TopBar />
      <HeatmapLegend />
      <StatCard />
      <Leaderboard />
      <CompareModal />
    </div>
  );
}
