import { Injectable } from "@nestjs/common";
import {
  RiskEntry,
  RiskQueryParams,
  PaginatedResponse,
  QualitativeRiskInput,
  QuantitativeRiskInput,
  QuantitativeSimulationInput,
} from "@risk-calculator/shared";
import {
  assessQualitativeRisk,
  assessQuantitativeRisk,
  runQuantitativeSimulation,
} from "@risk-calculator/shared";
import { RisksRepository } from "./risks.repository";

type SimStats = {
  iterations: number;
  mean: number;
  min: number;
  max: number;
};

@Injectable()
export class RisksService {
  constructor(private readonly repo: RisksRepository) {}

  // ---- Listado paginado
  async findAll(query: RiskQueryParams): Promise<PaginatedResponse<RiskEntry>> {
    return this.repo.findAll(query);
  }

  // ---- Obtener 1
  async findById(id: string): Promise<RiskEntry | null> {
    return this.repo.findById(id);
  }

  // ---- Crear cualitativo
  async createQualitative(input: QualitativeRiskInput): Promise<RiskEntry> {
    // crea el contenedor
    const risk = await this.repo.create(input, "qualitative");
    // calcula output
    const output = assessQualitativeRisk(input);
    // guarda el output en el objeto y persiste con update
    (risk as any).output = output;
    await this.repo.update(risk.id, input, "qualitative");
    return risk;
  }

  // ---- Crear cuantitativo
  async createQuantitative(input: QuantitativeRiskInput): Promise<RiskEntry> {
    const risk = await this.repo.create(input, "quantitative");
    const output = assessQuantitativeRisk(input);
    (risk as any).output = output;
    await this.repo.update(risk.id, input, "quantitative");
    return risk;
  }

  // ---- Borrar
  async delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  // ---- Stats agregadas
  async getStats(): Promise<{
    total: number;
    byType: Record<"qualitative" | "quantitative", number>;
    byBand: Record<string, number>;
    avgInherent: number;
    avgResidual: number;
  }> {
    return this.repo.getStats();
  }

  // ---- Simulación cuantitativa: devuelve STATS (no array)
  async runSimulation(input: QuantitativeSimulationInput): Promise<SimStats> {
    // En algunos esquemas tu QuantitativeSimulationInput trae barridos (sweep) y
    // no incluye iterations/volatility. Toma valores por defecto si no existen.
    const iterations =
      (input as any).iterations !== undefined
        ? (input as any).iterations
        : 1000;
    const volatility =
      (input as any).volatility !== undefined ? (input as any).volatility : 0.2;

    // Mapea al QuantitativeRiskInput consumido por el simulador base
    const qInput: QuantitativeRiskInput = {
      assetValue: input.assetValue,
      exposureFactor: input.exposureFactor,
      annualizedRateOfOccurrence: input.annualizedRateOfOccurrence,
      controlEffectiveness: input.controlEffectiveness,
      detectionCapability: input.detectionCapability,
      controlCost: input.controlCost,
    };

    return runQuantitativeSimulation(qInput, iterations, volatility);
  }
}
