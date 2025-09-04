// packages/shared/src/number-format.ts
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US',
  maximumFractionDigits: number = 2
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(n);
}

export function formatPercent(
  value: number,
  locale: string = 'en-US',
  maximumFractionDigits: number = 2
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits,
  }).format(n);
}
