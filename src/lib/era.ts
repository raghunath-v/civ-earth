/**
 * Map HDI tier to a Civ-style era label.
 * HDI thresholds inspired by UNDP brackets, mapped onto Civ V/VI eras.
 */
export function eraFromHdi(hdi: number): string {
  if (hdi >= 0.95) return 'Information';
  if (hdi >= 0.90) return 'Atomic';
  if (hdi >= 0.80) return 'Modern';
  if (hdi >= 0.70) return 'Industrial';
  if (hdi >= 0.60) return 'Renaissance';
  if (hdi >= 0.50) return 'Medieval';
  if (hdi >= 0.40) return 'Classical';
  return 'Antiquity';
}

export const ERA_ORDER = [
  'Antiquity',
  'Classical',
  'Medieval',
  'Renaissance',
  'Industrial',
  'Modern',
  'Atomic',
  'Information',
];
