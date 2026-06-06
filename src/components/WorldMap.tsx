import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geographies, Geography, Graticule, Sphere, ZoomableGroup } from 'react-simple-maps';
import { useStore } from '../store';
import { makeCivScoreColorScale, makeYieldColorScale } from '../lib/colorScale';
import { YIELD_META, type Country, type YieldKey } from '../types';

const WORLD = '/data/world-110m.json';
const STROKE_DEFAULT = 'rgb(13 27 42 / 0.8)';
const STROKE_HOVER = '#ffffff';
const STROKE_SELECTED = '#d4a017';
const STROKE_COMPARE = '#ffffff';
const DRAG_THRESHOLD_PX = 5;

export const WorldMap = memo(function WorldMap() {
  const countries = useStore((s) => s.countries);
  const byNumeric = useStore((s) => s.byNumeric);
  const selectedIso3 = useStore((s) => s.selectedIso3);
  const setSelected = useStore((s) => s.setSelected);
  const setHovered = useStore((s) => s.setHovered);
  const heatmap = useStore((s) => s.heatmapYield);
  const compareSlots = useStore((s) => s.compareSlots);
  const viewMode = useStore((s) => s.viewMode);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  // Globe rotation state: [lambda, phi, gamma]
  const [rotation, setRotation] = useState<[number, number, number]>([0, -15, 0]);
  const dragState = useRef<{
    startX: number; startY: number; startRot: [number, number, number]; moved: boolean; pointerId: number; captured: boolean;
  } | null>(null);
  /** Set true the moment a drag exceeds threshold; remains true through the click event so we can swallow it.
   *  Reset on the NEXT pointerdown (not pointerup), so the click handler still sees a true value. */
  const wasDragging = useRef(false);

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

  /* ── Globe drag handlers ──
   * Critical: we ONLY call setPointerCapture once we cross the drag threshold.
   * Otherwise pointer capture would redirect pointerup to the SVG and the
   * click event on the country path would never fire. */
  const onGlobePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    wasDragging.current = false;
    dragState.current = {
      startX: e.clientX, startY: e.clientY, startRot: rotation, moved: false,
      pointerId: e.pointerId, captured: false,
    };
  };
  const onGlobePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    const dist = Math.hypot(dx, dy);
    if (!ds.moved && dist > DRAG_THRESHOLD_PX) {
      ds.moved = true;
      wasDragging.current = true;
      // NOW capture, so subsequent moves come to us even if cursor leaves SVG
      try {
        (e.currentTarget as Element).setPointerCapture(ds.pointerId);
        ds.captured = true;
      } catch { /* ignore */ }
      setTooltip(null);
    }
    if (ds.moved) {
      const sens = 0.4;
      setRotation([
        ds.startRot[0] + dx * sens,
        Math.max(-89, Math.min(89, ds.startRot[1] - dy * sens)),
        ds.startRot[2],
      ]);
    }
  };
  const onGlobePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (ds?.captured) {
      try { (e.currentTarget as Element).releasePointerCapture(ds.pointerId); } catch { /* ignore */ }
    }
    dragState.current = null;
    // wasDragging is left set so the click handler can read it; cleared on next pointerdown.
  };

  const isGlobe = viewMode === 'globe';

  return (
    <div
      className="absolute inset-0"
      style={{ cursor: isGlobe ? (wasDragging.current ? 'grabbing' : 'grab') : 'default', touchAction: isGlobe ? 'none' : 'auto' }}
      onPointerDown={isGlobe ? onGlobePointerDown : undefined}
      onPointerMove={isGlobe ? onGlobePointerMove : undefined}
      onPointerUp={isGlobe ? onGlobePointerUp : undefined}
      onPointerCancel={isGlobe ? onGlobePointerUp : undefined}
    >
      <ComposableMap
        projection={isGlobe ? 'geoOrthographic' : 'geoEqualEarth'}
        projectionConfig={isGlobe
          ? { scale: 280, rotate: rotation }
          : { scale: 195 }
        }
        style={{
          width: '100%',
          height: '100%',
          background: 'rgb(var(--ocean))',
        }}
      >
        {isGlobe && (
          <>
            <Sphere id="globe-ocean" stroke="rgb(13 27 42 / 0.4)" strokeWidth={0.5} fill="rgb(var(--ocean))" />
            <Graticule stroke="rgb(255 255 255 / 0.06)" strokeWidth={0.4} step={[15, 15]} />
          </>
        )}
        {isGlobe ? (
          <Geographies geography={WORLD}>
            {({ geographies }) =>
              geographies.map((geo) => renderCountry(geo))
            }
          </Geographies>
        ) : (
          <ZoomableGroup center={[10, 15]} zoom={1} minZoom={0.8} maxZoom={5}>
            <Geographies geography={WORLD}>
              {({ geographies }) =>
                geographies.map((geo) => renderCountry(geo))
              }
            </Geographies>
          </ZoomableGroup>
        )}
      </ComposableMap>

      {/* Globe hint */}
      {isGlobe && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-30 text-[11px] font-medium text-white/60 px-2.5 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
          drag to rotate
        </div>
      )}

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

  /* ── Shared country rendering (used in both views) ── */
  function renderCountry(geo: { id?: string | number; rsmKey: string; properties?: { name?: string } }) {
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
          if (isGlobe && wasDragging.current) return;
          const text = tooltipText(country, String(geo.properties?.name ?? '—'));
          if (country) setHovered(country.iso3);
          setTooltip({ x: evt.clientX, y: evt.clientY, text });
        }}
        onMouseMove={isTouchDevice ? undefined : (evt) => {
          if (isGlobe && wasDragging.current) return;
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
          // Suppress click if we were dragging the globe
          if (isGlobe && wasDragging.current) return;
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
  }
});
