import type {
  QualitativeRiskInput,
  QualitativeRiskOutput,
  QuantitativeRiskInput,
  QuantitativeRiskOutput,
} from './types';

export function bandFromScore(score: number) {
  if (score <= 5) return 'Low';
  if (score <= 10) return 'Moderate';
  if (score <= 15) return 'High';
  return 'Extreme';
}

export function getHeatmapCellColor(l: number, i: number) {
  const s = l * i;
  const band = bandFromScore(s);
  const palette: Record<string, string> = {
    Low: '#b7e4c7',
    Moderate: '#ffd166',
    High: '#f8961e',
    Extreme: '#e63946',
  };
  return palette[band] || '#ccc';
}

export function assessQualitativeRisk(
  input: QualitativeRiskInput
): QualitativeRiskOutput {
  const likelihood = input.likelihood;
  const impact = input.impact;
  const ce = input.controlEffectiveness ?? 0;
  const dc = input.detectionCapability ?? 0;

  const inherentSeverity = likelihood * impact;

  const residualLikelihood = Math.max(1, Math.round(likelihood * (1 - ce)));
  const residualImpact = Math.max(1, Math.round(impact * (1 - dc * 0.5)));
  const residualSeverity = residualLikelihood * residualImpact;

  return {
    inherentSeverity,
    residualLikelihood, // ← ahora coincide con el schema/tipo
    residualImpact, // ← ahora coincide con el schema/tipo
    residualSeverity,
    inherentBand: bandFromScore(inherentSeverity) as any,
    residualBand: bandFromScore(residualSeverity) as any,
  };
}

export function assessQuantitativeRisk(
  input: QuantitativeRiskInput
): QuantitativeRiskOutput {
  const av = input.assetValue;
  const ef = input.exposureFactor;
  const aro = input.annualizedRateOfOccurrence;
  const cost = input.controlCost ?? 0;
  const ce = input.controlEffectiveness ?? 0;
  const dc = input.detectionCapability ?? 0;

  const sle = av * ef;
  const aleInherent = sle * aro;
  const aleResidual = aleInherent * (1 - ce) * (1 - dc * 0.5);
  const netResidual = aleResidual + cost;

  return { sle, aleInherent, aleResidual, netResidual }; // ← ahora coincide con el schema/tipo
}
