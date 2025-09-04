export const RISK_BANDS = {
  LOW: { min: 1, max: 5, label: 'Low' as const },
  MODERATE: { min: 6, max: 10, label: 'Moderate' as const },
  HIGH: { min: 11, max: 15, label: 'High' as const },
  EXTREME: { min: 16, max: 25, label: 'Extreme' as const },
} as const;

export const RISK_BAND_THRESHOLDS = [
  { min: 1, max: 5, band: 'Low' as const, color: '#10B981' }, // green
  { min: 6, max: 10, band: 'Moderate' as const, color: '#F59E0B' }, // yellow
  { min: 11, max: 15, band: 'High' as const, color: '#EF4444' }, // red
  { min: 16, max: 25, band: 'Extreme' as const, color: '#7C2D12' }, // dark red
] as const;

export const HEATMAP_COLORS = {
  Low: '#10B981', // green
  Moderate: '#F59E0B', // yellow
  High: '#EF4444', // red
  Extreme: '#7C2D12', // dark red
} as const;

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 10,
} as const;

export const MAX_PAGE_SIZE = 100;

export const DEFAULT_SORT = {
  sortBy: 'createdAt' as const,
  order: 'desc' as const,
} as const;

