import { motion } from 'framer-motion';
import type { PoliticalPoint } from '../types';

interface Props {
  history: PoliticalPoint[];
  size?: number;
}

/**
 * 2D political compass.
 * X axis: Economic — 0 (state-led / left) → 10 (market / right)
 * Y axis: Authority — 0 (libertarian) at TOP → 10 (authoritarian) at BOTTOM
 *
 * Background quadrants (Civ V flavor): Order (top-left state-egalitarian),
 * Freedom (top-right liberal), Autocracy (bottom).
 */
export function PoliticalCompass({ history, size = 220 }: Props) {
  const padL = 26;
  const padR = 8;
  const padT = 10;
  const padB = 28;
  const w = size - padL - padR;
  const h = size - padT - padB;
  const toX = (econ: number) => padL + (econ / 10) * w;
  const toY = (auth: number) => padT + (auth / 10) * h;

  const sorted = [...history].sort((a, b) => a.year - b.year);
  const latest = sorted[sorted.length - 1];

  return (
    <svg width={size} height={size} className="block text-ink">
      {/* zones */}
      <rect x={padL} y={padT} width={w / 2} height={h / 2} fill="#a86bd1" opacity="0.10" />
      <text x={padL + 4} y={padT + 11} fontSize="8" fontWeight="700" fill="#a86bd1" opacity="0.85">ORDER</text>

      <rect x={padL + w / 2} y={padT} width={w / 2} height={h / 2} fill="#3a8ed1" opacity="0.10" />
      <text x={padL + w - 38} y={padT + 11} fontSize="8" fontWeight="700" fill="#3a8ed1" opacity="0.85">FREEDOM</text>

      <rect x={padL} y={padT + h / 2} width={w} height={h / 2} fill="#c0392b" opacity="0.08" />
      <text x={padL + w / 2 - 28} y={padT + h - 4} fontSize="8" fontWeight="700" fill="#c0392b" opacity="0.8">AUTOCRACY</text>

      {/* mid-grid */}
      <line x1={padL} y1={padT + h / 2} x2={padL + w} y2={padT + h / 2} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
      <line x1={padL + w / 2} y1={padT} x2={padL + w / 2} y2={padT + h} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />

      {/* border */}
      <rect x={padL} y={padT} width={w} height={h} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />

      {/* drift trail */}
      <polyline
        points={sorted.map((p) => `${toX(p.econ)},${toY(p.auth)}`).join(' ')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.45"
      />
      {sorted.map((p, i) => {
        const isLatest = i === sorted.length - 1;
        return (
          <g key={p.year}>
            {isLatest && (
              <motion.circle
                cx={toX(p.econ)} cy={toY(p.auth)} r={10}
                fill="none" stroke="#d4a017" strokeWidth={1.5}
                animate={{ r: [6, 14], opacity: [0.6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', repeatDelay: 1 }}
              />
            )}
            <circle
              cx={toX(p.econ)}
              cy={toY(p.auth)}
              r={isLatest ? 6 : 3}
              fill={isLatest ? '#d4a017' : 'currentColor'}
              stroke="rgb(var(--surface-2))"
              strokeWidth={isLatest ? 2 : 1}
              opacity={isLatest ? 1 : 0.45}
            />
            {isLatest && (
              <text x={toX(p.econ) + 9} y={toY(p.auth) + 3} fontSize="9" fontWeight="700" fill="currentColor">
                {p.year}
              </text>
            )}
          </g>
        );
      })}

      {/* X-axis label (below the plot) */}
      <text x={padL + 2} y={size - 14} fontSize="8" fontWeight="600" fill="currentColor" opacity="0.55">← state-led</text>
      <text x={padL + w - 40} y={size - 14} fontSize="8" fontWeight="600" fill="currentColor" opacity="0.55">market →</text>

      {/* Y-axis label (vertical, left of the plot) */}
      <text x={padL - 12} y={padT + 4} fontSize="8" fontWeight="600" fill="currentColor" opacity="0.55" transform={`rotate(-90 ${padL - 12} ${padT + 4})`} textAnchor="end">libertarian ↑</text>
      <text x={padL - 12} y={padT + h} fontSize="8" fontWeight="600" fill="currentColor" opacity="0.55" transform={`rotate(-90 ${padL - 12} ${padT + h})`} textAnchor="start">↓ authoritarian</text>

      {/* drift summary */}
      <text x={size / 2} y={size - 2} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="currentColor" opacity="0.45">
        drift since {sorted[0]?.year ?? '—'} · now ({latest?.econ.toFixed(1)}, {(10 - latest?.auth).toFixed(1)})
      </text>
    </svg>
  );
}
