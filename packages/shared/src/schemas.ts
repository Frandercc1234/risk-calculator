import { z } from 'zod';

/** ─ CUALITATIVO ─ */
export const qualitativeRiskInputSchema = z.object({
  assetName: z.string().min(1),
  threatDescription: z.string().min(1),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  controlEffectiveness: z.number().min(0).max(1).default(0).optional(),
  detectionCapability: z.number().min(0).max(1).default(0).optional(),
});

export const riskBandSchema = z.enum(['Low', 'Moderate', 'High', 'Extreme']);

export const qualitativeRiskOutputSchema = z.object({
  inherentSeverity: z.number(),
  residualLikelihood: z.number(),
  residualImpact: z.number(),
  residualSeverity: z.number(),
  inherentBand: riskBandSchema,
  residualBand: riskBandSchema,
});

/** ─ CUANTITATIVO ─ */
export const quantitativeRiskInputSchema = z.object({
  assetValue: z.number().nonnegative(),
  exposureFactor: z.number().min(0).max(1),
  annualizedRateOfOccurrence: z.number().min(0),
  controlCost: z.number().min(0).default(0).optional(),
  controlEffectiveness: z.number().min(0).max(1).default(0).optional(),
  detectionCapability: z.number().min(0).max(1).default(0).optional(),
});

export const quantitativeRiskOutputSchema = z.object({
  sle: z.number(),
  aleInherent: z.number(),
  aleResidual: z.number(),
  netResidual: z.number(), // <- tiene que estar
});

/** ─ SIMULACIÓN ─ */
export const quantitativeSimulationInputSchema = z.object({
  assetValue: z.number().nonnegative(),
  exposureFactor: z.number().min(0).max(1),
  annualizedRateOfOccurrence: z.number().min(0),
  controlCost: z.number().min(0).default(0).optional(),
  controlEffectiveness: z.number().min(0).max(1).default(0).optional(),
  detectionCapability: z.number().min(0).max(1).default(0).optional(),
  sweep: z.object({
    controlEffectiveness: z.array(z.number().min(0).max(1)),
    detectionCapability: z.array(z.number().min(0).max(1)).optional(),
  }),
});

/** ─ QUERY /risks ─ */
export const riskQuerySchema = z.object({
  type: z.enum(['qualitative', 'quantitative']).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(10).optional(),
  sortBy: z.enum(['createdAt', 'severity', 'ale']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

/** (opcional) esquema básico de item guardado */
export const riskEntrySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  type: z.enum(['qualitative', 'quantitative']),
});

