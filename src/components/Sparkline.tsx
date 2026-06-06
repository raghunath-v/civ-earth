import { motion } from 'framer-motion';
import type { TimeSeries } from '../lib/timeseries';

interface Props {
  series: TimeSeries;
  color: string;
  width?: number;
  height?: number;
}

/**
 * Tiny inline SVG sparkline. Shows the trend for a yield over 20 years.
 * Only renders if there are ≥3 non-null data points.
 */
export function Sparkline({ series, color, width = 64, height = 18 }: Props) {
  const valid = series.filter((p): p is [number, number] => p[1] !== null);
  if (valid.length < 3) return null;

  const minV = Math.min(...valid.map((p) => p[1]));
  const maxV = Math.max(...valid.map((p) => p[1]));
  const minY = valid[0][0];
  const maxY = valid[valid.length - 1][0];
  const pad = 1;

  const toX = (year: number) => pad + ((year - minY) / (maxY - minY || 1)) * (width - pad * 2);
  const toY = (val: number) => (height - pad) - ((val - minV) / (maxV - minV || 1)) * (height - pad * 2);

  const pts = valid.map((p) => `${toX(p[0]).toFixed(1)},${toY(p[1]).toFixed(1)}`).join(' ');
  const lastPt = valid[valid.length - 1];

  return (
    <svg width={width} height={height} className="block overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* Animated reveal on mount */}
      <motion.polyline
        points={pts}
        fill="none"
        stroke="rgb(var(--surface-2))"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ strokeDasharray: width * 3, strokeDashoffset: width * 3 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      />
      {/* Latest dot */}
      <circle cx={toX(lastPt[0])} cy={toY(lastPt[1])} r={2.5} fill={color} opacity={0.9} />
    </svg>
  );
}
