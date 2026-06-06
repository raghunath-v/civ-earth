import { create } from 'zustand';
import type { Country, YieldKey } from './types';

interface Store {
  countries: Country[];
  byIso3: Record<string, Country>;
  byNumeric: Record<string, Country>;

  selectedIso3: string | null;
  hoveredIso3: string | null;
  compareSlots: [string | null, string | null];
  heatmapYield: YieldKey | 'civScore' | null;
  leaderboardOpen: boolean;
  showCompareModal: boolean;
  viewMode: 'map' | 'globe';

  setCountries(list: Country[]): void;
  setSelected(iso3: string | null): void;
  setHovered(iso3: string | null): void;
  addToCompare(iso3: string): void;
  setCompareSlot(slot: 0 | 1, iso3: string | null): void;
  removeFromCompare(slot: 0 | 1): void;
  clearCompare(): void;
  setHeatmapYield(y: YieldKey | 'civScore' | null): void;
  setLeaderboardOpen(open: boolean): void;
  openCompareModal(): void;
  closeCompareModal(): void;
  setViewMode(m: 'map' | 'globe'): void;
}

export const useStore = create<Store>((set, get) => ({
  countries: [],
  byIso3: {},
  byNumeric: {},
  selectedIso3: null,
  hoveredIso3: null,
  compareSlots: [null, null],
  heatmapYield: null,
  leaderboardOpen: false,
  showCompareModal: false,
  viewMode: 'map',

  setCountries(list) {
    const byIso3: Record<string, Country> = {};
    const byNumeric: Record<string, Country> = {};
    for (const c of list) {
      byIso3[c.iso3] = c;
      byNumeric[c.numeric] = c;
    }
    set({ countries: list, byIso3, byNumeric });
  },

  setSelected(iso3) { set({ selectedIso3: iso3 }); },
  setHovered(iso3) { set({ hoveredIso3: iso3 }); },

  addToCompare(iso3) {
    const [a, b] = get().compareSlots;
    if (a === iso3 || b === iso3) return;
    if (!a) {
      set({ compareSlots: [iso3, b] });
    } else if (!b) {
      set({ compareSlots: [a, iso3], showCompareModal: true });
    } else {
      // Both filled; replace slot B
      set({ compareSlots: [a, iso3], showCompareModal: true });
    }
  },
  setCompareSlot(slot, iso3) {
    const s = [...get().compareSlots] as [string | null, string | null];
    s[slot] = iso3;
    set({ compareSlots: s });
  },
  removeFromCompare(slot) {
    const s = [...get().compareSlots] as [string | null, string | null];
    s[slot] = null;
    set({ compareSlots: s });
  },
  clearCompare() { set({ compareSlots: [null, null], showCompareModal: false }); },

  setHeatmapYield(y) { set({ heatmapYield: y }); },
  setLeaderboardOpen(open) { set({ leaderboardOpen: open }); },
  openCompareModal() { set({ showCompareModal: true }); },
  closeCompareModal() { set({ showCompareModal: false }); },
  setViewMode(m) { set({ viewMode: m }); },
}));
