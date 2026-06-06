import { memo, useCallback, useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useStore } from '../store';
import { makeCivScoreColorScale, makeYieldColorScale } from '../lib/colorScale';
import { YIELD_META, type Country, type YieldKey } from '../types';

const WORLD = '/data/world-110m.json';
const STROKE_DEFAULT = 'rgb(13 27 42 / 0.8)';
const STROKE_HOVER = '#ffffff';
const STROKE_SELECTED = '#d4a017';
const STROKE_COMPARE = '#ffffff';

export const WorldMap = memo(function WorldMap() {
  const countries = useStore((s) => s.countries);
  const byNumeric = useStore((s) => s.byNumeric);
  const selectedIso3 = useStore((s) => s.selectedIso3);
  const setSelected = useStore((s) => s.setSelected);
  const setHovered = useStore((s) => s.setHovered);
  const heatmap = useStore((s) => s.heatmapYield);
  const compareSlots = useStore((s) => s.compareSlots);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const colorFor = useMemo(() => {
    if (!heatmap) return makeCivScoreColorScale(countries);
    if (heatmap === 'civScore') return makeCivScoreColorScale(countries);
    return makeYieldColorScale(countries, heatmap as YieldKey);
  }, [countries, heatmap]);

  const tooltipText = useCallback(
    (c: Country | undefined, fallback: string): string => {
      if (!c) return fallback;
      const active = heatmap ?? 'civScore';
      if (active === 'civScore') return `${c.flag} ${c.name} · Civ Score ${c.civScore ?? '—'}`;
      const k = active as YieldKey;
      return `${c.flag} ${c.name} · ${YIELD_META[k].icon} ${YIELD_META[k].label}: ${c.yields[k].display}`;
    },
    [heatmap]
  );

  return (
    <div className="absolute inset-0">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 195 }}
        style={{ width: '100%', height: '100%', background: 'rgb(var(--ocean))' }}
      >
        <ZoomableGroup center={[10, 15]} zoom={1} minZoom={0.8} maxZoom={5}>
          <Geographies geography={WORLD}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numId = String(geo.id);
                const country: Country | undefined = byNumeric[numId];
                const iso3 = country?.iso3;
                const fill = country ? colorFor(country.iso3) : 'rgb(58 74 90)';
                const isSelected = iso3 && iso3 === selectedIso3;
                const isCompare = iso3 && (compareSlots[0] === iso3 || compareSlots[1] === iso3);
                const stroke = isSelected ? STROKE_SELECTED : isCompare ? STROKE_COMPARE : STROKE_DEFAULT;
                const strokeWidth = isSelected || isCompare ? 1.4 : 0.4;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={isTouchDevice ? undefined : (evt) => {
                      const text = tooltipText(country, String(geo.properties?.name ?? '—'));
                      if (country) setHovered(country.iso3);
                      setTooltip({ x: evt.clientX, y: evt.clientY, text });
                    }}
                    onMouseMove={isTouchDevice ? undefined : (evt) => {
                      const text = tooltipText(country, String(geo.properties?.name ?? '—'));
                      setTooltip((prev) =>
                        prev && prev.text === text
                          ? { ...prev, x: evt.clientX, y: evt.clientY }
                          : { x: evt.clientX, y: evt.clientY, text }
                      );
                    }}
                    onMouseLeave={isTouchDevice ? undefined : () => {
                      setHovered(null);
                      setTooltip(null);
                    }}
                    onClick={() => {
                      if (country) setSelected(country.iso3);
                    }}
                    style={{
                      default: {
                        fill,
                        stroke,
                        strokeWidth,
                        outline: 'none',
                        cursor: country ? 'pointer' : 'default',
                      },
                      hover: {
                        fill,
                        stroke: STROKE_HOVER,
                        strokeWidth: 1.2,
                        outline: 'none',
                        cursor: country ? 'pointer' : 'default',
                      },
                      pressed: { fill, stroke: STROKE_SELECTED, strokeWidth: 1.6, outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 glass px-2.5 py-1.5 text-[12px] font-medium text-ink"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
});
