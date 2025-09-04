// packages/shared/src/seed-data.ts
import { generateId, getCurrentTimestamp } from "./utils.js";
import { assessQualitativeRisk, assessQuantitativeRisk } from "./risk-utils.js";
import type {
  QualitativeRiskInput,
  QuantitativeRiskInput,
  QualitativeRiskEntry,
  QuantitativeRiskEntry,
  RiskEntry,
} from "./types.js";

// Crea un RiskEntry cualitativo válido (con output)
export function makeQualitativeSeed(
  input: QualitativeRiskInput
): QualitativeRiskEntry {
  const output = assessQualitativeRisk(input);
  return {
    id: generateId(),
    type: "qualitative",
    input,
    output,
    createdAt: getCurrentTimestamp(),
  };
}

// Crea un RiskEntry cuantitativo válido (con output)
export function makeQuantitativeSeed(
  input: QuantitativeRiskInput
): QuantitativeRiskEntry {
  const output = assessQuantitativeRisk(input);
  return {
    id: generateId(),
    type: "quantitative",
    input,
    output,
    createdAt: getCurrentTimestamp(),
  };
}

// Opcional: seeds de ejemplo
export function defaultSeeds(): RiskEntry[] {
  const ql = makeQualitativeSeed({
    assetName: "Core DB",
    threatDescription: "SQL injection",
    likelihood: 4,
    impact: 5,
    controlEffectiveness: 0.4,
    detectionCapability: 0.6,
  });

  const qt = makeQuantitativeSeed({
    assetValue: 50_000,
    exposureFactor: 0.3,
    annualizedRateOfOccurrence: 0.5,
    controlCost: 2_000,
    controlEffectiveness: 0.4,
    detectionCapability: 0.3,
  });

  return [ql, qt];
}
