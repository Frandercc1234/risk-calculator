// packages/shared/src/simulation.ts
import type { QuantitativeRiskInput } from "./types.js";
import { assessQuantitativeRisk } from "./risk-utils.js";

/**
 * Simulación simple: perturba EF y ARO con volatilidad y calcula stats de netResidual.
 */
export function runQuantitativeSimulation(
  input: QuantitativeRiskInput,
  iterations = 1000,
  volatility = 0.2
) {
  const results: number[] = [];

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const perturb = (v: number) =>
    v * (1 + (Math.random() - 0.5) * 2 * volatility);

  for (let i = 0; i < iterations; i++) {
    const sample: QuantitativeRiskInput = {
      ...input,
      exposureFactor: clamp01(perturb(input.exposureFactor)),
      annualizedRateOfOccurrence: Math.max(
        0,
        perturb(input.annualizedRateOfOccurrence)
      ),
    };
    const res = assessQuantitativeRisk(sample);
    results.push(res.netResidual);
  }

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  return {
    iterations,
    mean,
    min: Math.min(...results),
    max: Math.max(...results),
  };
}
