// packages/shared/src/index.ts

// ---- Schemas
export {
  qualitativeRiskInputSchema,
  qualitativeRiskOutputSchema,
  quantitativeRiskInputSchema,
  quantitativeRiskOutputSchema,
  quantitativeSimulationInputSchema,
  riskQuerySchema,
} from "./schemas.js";

// alias de compatibilidad para código viejo
export { riskQuerySchema as riskQueryParamsSchema } from "./schemas.js";

// ---- Types (usa .js)
export type {
  QualitativeRiskInput,
  QualitativeRiskOutput,
  QuantitativeRiskInput,
  QuantitativeRiskOutput,
  QuantitativeSimulationInput,
  RiskEntry,
  RiskQueryParams,
  SimulationScenario,
  RiskBand,
  ApiResult,
  PaginatedResponse,
  RiskType,
} from "./types.js";

// ---- Risk utilities
export {
  assessQualitativeRisk,
  assessQuantitativeRisk,
  bandFromScore,
  getHeatmapCellColor,
} from "./risk-utils.js";

// ---- Formatting helpers
export { formatCurrency, formatPercent } from "./number-format.js";

// ---- Utils generales (backend los usa)
export {
  generateId,
  getCurrentTimestamp,
  sortBy,
  calculatePagination,
} from "./utils.js";

// ---- Simulación (si el backend la llama)
export { runQuantitativeSimulation } from "./simulation.js";
