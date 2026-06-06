# Civ Earth

A real-world map where every country gets a Civilization-style stat card. GDP becomes **Gold**, R&D spending becomes **Science**, UNESCO sites become **Wonders**, World Happiness becomes **Amenities**. 174 countries, real numbers, every figure cited to its source.

Link: https://civearth.netlify.app/

<img width="1707" height="972" alt="Screenshot 2026-06-06 at 19 10 06" src="https://github.com/user-attachments/assets/a4cb1f68-fa13-467c-8d4c-b4f89bc7e7b7" />


## What it does

- **Click any country** on the world map to open its stat card: 8 Civ-style yields, era badge (from HDI tier), ruling coalition, a **2D political compass** with a 30-year drift trail, civic indicators, alliances, UNESCO wonders, great people, top exports.
- **Heatmap toggle** — recolor the whole map by Civ Score, Gold, Science, Culture, Production, Food, Faith, Amenities, or Military.
- **Compare two countries** side-by-side, yield-by-yield with the winner highlighted.
- **Leaderboard** — top 15 by any yield or by the composite Civ Score.
- **Multi-source democracy band** — V-Dem, EIU Democracy Index, Freedom House, and Polity5 displayed together. If they disagree, the card says so.

## Data sources

All numbers are snapshot values from public datasets, mostly 2023–2024:

- [World Bank Open Data](https://data.worldbank.org/) — GDP, R&D, manufacturing, military, population, agriculture, exports
- [UNDP Human Development Report](https://hdr.undp.org/) — HDI (drives the era badge)
- [UNESCO World Heritage Centre](https://whc.unesco.org/) — Wonders
- [World Happiness Report](https://worldhappiness.report/data/) — Amenities yield
- [V-Dem v14](https://v-dem.net/) — Liberal Democracy Index + 30-year political drift
- [EIU Democracy Index](https://www.eiu.com/n/campaigns/democracy-index/)
- [Freedom House](https://freedomhouse.org/) — Freedom in the World
- [Polity5 / Center for Systemic Peace](https://www.systemicpeace.org/polityproject.html)
- [Reporters Without Borders](https://rsf.org/) — Press Freedom
- [Transparency International CPI](https://www.transparency.org/en/cpi)
- [Fraser Institute Economic Freedom Index](https://www.fraserinstitute.org/economic-freedom/dataset) — economic axis of the political compass
- [SIPRI Military Expenditure](https://www.sipri.org/databases/milex)
- [Pew Research](https://www.pewresearch.org/religion/) — religious composition / religiosity

Every stat card has a "Sources" section listing the relevant datasets with deep-links.

## How Civ Score is computed

Z-score normalize each of the 8 yields across all countries, weight them (Gold/Science/Production heavier, Faith lighter), average, and rescale to 0–1000. It's a synthetic composite — useful for ranking, not a published statistic. The weights are visible in `src/types.ts`.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion for animations
- Zustand for state
- react-simple-maps + d3-geo/d3-scale + TopoJSON

No backend. Pure static SPA. The full dataset is bundled at build time as JSON in `src/data/`.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Static output in `dist/` — deploy to Vercel / Netlify / GitHub Pages / Cloudflare Pages.

## Project layout

```
src/
├── components/        React components (WorldMap, StatCard, PoliticalCompass, ...)
├── data/              Country dataset (detailed + compact baselines per region)
├── lib/               Civ Score computation, era mapping, color scales, source links
├── store.ts           Zustand state
├── types.ts           Country / Yield / etc. types
└── App.tsx
public/data/world-110m.json   World map TopoJSON (from `world-atlas`)
```
