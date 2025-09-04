import { z } from "zod";
import {
  qualitativeRiskInputSchema,
  qualitativeRiskOutputSchema,
  quantitativeRiskInputSchema,
  quantitativeRiskOutputSchema,
  quantitativeSimulationInputSchema,
  riskQuerySchema,
} from "./schemas.js";

// ---- Tipos base desde Schemas
export type QualitativeRiskInput = z.infer<typeof qualitativeRiskInputSchema>;
export type QualitativeRiskOutput = z.infer<typeof qualitativeRiskOutputSchema>;

export type QuantitativeRiskInput = z.infer<typeof quantitativeRiskInputSchema>;
export type QuantitativeRiskOutput = z.infer<
  typeof quantitativeRiskOutputSchema
> & {
  // compat: muchas partes esperan este campo
  netResidual: number;
};

export type QuantitativeSimulationInput = z.infer<
  typeof quantitativeSimulationInputSchema
>;
export type RiskQueryParams = z.infer<typeof riskQuerySchema>;

// ---- Tipos faltantes que pide el backend
export type RiskBand = "Low" | "Moderate" | "High" | "Extreme";
export type RiskType = "qualitative" | "quantitative";

export type SimulationScenario = {
  iterations: number;
  volatility?: number;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// ---- Entradas con output (lo exige tu repositorio/servicio)
export type QualitativeRiskEntry = {
  id: string;
  type: "qualitative";
  input: QualitativeRiskInput;
  output: QualitativeRiskOutput;
  createdAt: string;
};

export type QuantitativeRiskEntry = {
  id: string;
  type: "quantitative";
  input: QuantitativeRiskInput;
  output: QuantitativeRiskOutput;
  createdAt: string;
};

export type RiskEntry = QualitativeRiskEntry | QuantitativeRiskEntry;
