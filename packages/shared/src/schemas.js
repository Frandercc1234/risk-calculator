"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskEntrySchema = exports.riskQuerySchema = exports.quantitativeSimulationInputSchema = exports.quantitativeRiskOutputSchema = exports.quantitativeRiskInputSchema = exports.qualitativeRiskOutputSchema = exports.riskBandSchema = exports.qualitativeRiskInputSchema = void 0;
var zod_1 = require("zod");
/** ─ CUALITATIVO ─ */
exports.qualitativeRiskInputSchema = zod_1.z.object({
    assetName: zod_1.z.string().min(1),
    threatDescription: zod_1.z.string().min(1),
    likelihood: zod_1.z.number().int().min(1).max(5),
    impact: zod_1.z.number().int().min(1).max(5),
    controlEffectiveness: zod_1.z.number().min(0).max(1).default(0).optional(),
    detectionCapability: zod_1.z.number().min(0).max(1).default(0).optional(),
});
exports.riskBandSchema = zod_1.z.enum(['Low', 'Moderate', 'High', 'Extreme']);
exports.qualitativeRiskOutputSchema = zod_1.z.object({
    inherentSeverity: zod_1.z.number(),
    residualLikelihood: zod_1.z.number(),
    residualImpact: zod_1.z.number(),
    residualSeverity: zod_1.z.number(),
    inherentBand: exports.riskBandSchema,
    residualBand: exports.riskBandSchema,
});
/** ─ CUANTITATIVO ─ */
exports.quantitativeRiskInputSchema = zod_1.z.object({
    assetValue: zod_1.z.number().nonnegative(),
    exposureFactor: zod_1.z.number().min(0).max(1),
    annualizedRateOfOccurrence: zod_1.z.number().min(0),
    controlCost: zod_1.z.number().min(0).default(0).optional(),
    controlEffectiveness: zod_1.z.number().min(0).max(1).default(0).optional(),
    detectionCapability: zod_1.z.number().min(0).max(1).default(0).optional(),
});
exports.quantitativeRiskOutputSchema = zod_1.z.object({
    sle: zod_1.z.number(),
    aleInherent: zod_1.z.number(),
    aleResidual: zod_1.z.number(),
    netResidual: zod_1.z.number(), // <- tiene que estar
});
/** ─ SIMULACIÓN ─ */
exports.quantitativeSimulationInputSchema = zod_1.z.object({
    assetValue: zod_1.z.number().nonnegative(),
    exposureFactor: zod_1.z.number().min(0).max(1),
    annualizedRateOfOccurrence: zod_1.z.number().min(0),
    controlCost: zod_1.z.number().min(0).default(0).optional(),
    controlEffectiveness: zod_1.z.number().min(0).max(1).default(0).optional(),
    detectionCapability: zod_1.z.number().min(0).max(1).default(0).optional(),
    sweep: zod_1.z.object({
        controlEffectiveness: zod_1.z.array(zod_1.z.number().min(0).max(1)),
        detectionCapability: zod_1.z.array(zod_1.z.number().min(0).max(1)).optional(),
    }),
});
/** ─ QUERY /risks ─ */
exports.riskQuerySchema = zod_1.z.object({
    type: zod_1.z.enum(['qualitative', 'quantitative']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1).optional(),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(10).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'severity', 'ale']).optional(),
    order: zod_1.z.enum(['asc', 'desc']).optional(),
});
/** (opcional) esquema básico de item guardado */
exports.riskEntrySchema = zod_1.z.object({
    id: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    type: zod_1.z.enum(['qualitative', 'quantitative']),
});
