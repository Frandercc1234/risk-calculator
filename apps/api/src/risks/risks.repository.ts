import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import { dirname } from "path";
import {
  RiskEntry,
  RiskQueryParams,
  PaginatedResponse,
  QualitativeRiskInput,
  QuantitativeRiskInput,
  RiskType,
} from "@risk-calculator/shared";
import {
  generateId,
  getCurrentTimestamp,
  calculatePagination,
  sortBy,
} from "@risk-calculator/shared";

@Injectable()
export class RisksRepository {
  private risks: RiskEntry[] = [];
  private persistPath: string | null = null;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null; // ✅

  constructor() {
    this.persistPath = process.env.PERSIST_PATH || null;
    this.loadFromFile();
  }

  private async loadFromFile(): Promise<void> {
    if (!this.persistPath) return;

    try {
      const data = await fs.readFile(this.persistPath, "utf-8");
      this.risks = JSON.parse(data);
      console.log(`Loaded ${this.risks.length} risks from ${this.persistPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("Error loading risks from file:", error);
      }
    }
  }

  private async saveToFile(): Promise<void> {
    if (!this.persistPath) return;

    try {
      const dir = dirname(this.persistPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.persistPath, JSON.stringify(this.risks, null, 2));
    } catch (error) {
      console.error("Error saving risks to file:", error);
    }
  }

  private debouncedSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => this.saveToFile(), 1000);
  }

  async findAll(
    query: RiskQueryParams = {}
  ): Promise<PaginatedResponse<RiskEntry>> {
    let filteredRisks = [...this.risks];

    // Filtro por tipo
    if (query.type) {
      filteredRisks = filteredRisks.filter((risk) => risk.type === query.type);
    }

    // Orden
    const sortByField = (query.sortBy || "createdAt") as string;
    const sortOrder = (query.order || "desc") as "asc" | "desc";

    if (sortByField === "severity") {
      filteredRisks = filteredRisks.sort((a, b) => {
        const aSeverity =
          a.type === "qualitative"
            ? (a.output as any).inherentSeverity
            : (a.output as any).aleInherent;
        const bSeverity =
          b.type === "qualitative"
            ? (b.output as any).inherentSeverity
            : (b.output as any).aleInherent;
        return sortOrder === "asc"
          ? aSeverity - bSeverity
          : bSeverity - aSeverity;
      });
    } else if (sortByField === "ale") {
      filteredRisks = filteredRisks
        .filter((risk) => risk.type === "quantitative")
        .sort((a, b) => {
          const aAle = (a.output as any).aleInherent;
          const bAle = (b.output as any).aleInherent;
          return sortOrder === "asc" ? aAle - bAle : bAle - aAle;
        });
    } else {
      // sortBy del shared: key + order
      filteredRisks = sortBy(
        filteredRisks,
        sortByField as keyof RiskEntry, // ✅ key, no función
        sortOrder
      );
    }

    // Paginación (usa firma original del shared)
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;

    const pagination = calculatePagination(
      page,
      pageSize,
      filteredRisks.length
    ); // ✅
    const items = filteredRisks.slice(
      pagination.offset,
      pagination.offset + pageSize
    );

    // PaginatedResponse<T>
    return {
      items, // ✅
      total: pagination.total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  async findById(id: string): Promise<RiskEntry | null> {
    return this.risks.find((risk) => risk.id === id) || null;
  }

  async create(
    input: QualitativeRiskInput | QuantitativeRiskInput,
    type: RiskType
  ): Promise<RiskEntry> {
    let risk: RiskEntry; // ✅ discrimina para satisfacer la unión
    if (type === "qualitative") {
      risk = {
        id: generateId(),
        type: "qualitative",
        createdAt: getCurrentTimestamp(),
        input: input as QualitativeRiskInput,
        output: {} as any, // lo llenará el service
      };
    } else {
      risk = {
        id: generateId(),
        type: "quantitative",
        createdAt: getCurrentTimestamp(),
        input: input as QuantitativeRiskInput,
        output: {} as any, // lo llenará el service
      };
    }

    this.risks.push(risk);
    this.debouncedSave();
    return risk;
  }

  async update(
    id: string,
    input: QualitativeRiskInput | QuantitativeRiskInput,
    type: RiskType
  ): Promise<RiskEntry | null> {
    const index = this.risks.findIndex((risk) => risk.id === id);
    if (index === -1) return null;

    const existing = this.risks[index];

    // Mantén el tipo discriminante correcto
    if (existing.type === "qualitative") {
      this.risks[index] = {
        ...existing,
        type: "qualitative",
        input: input as QualitativeRiskInput,
      };
    } else {
      this.risks[index] = {
        ...existing,
        type: "quantitative",
        input: input as QuantitativeRiskInput,
      };
    }

    this.debouncedSave();
    return this.risks[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.risks.findIndex((risk) => risk.id === id);
    if (index === -1) return false;
    this.risks.splice(index, 1);
    this.debouncedSave();
    return true;
  }

  async getStats(): Promise<{
    total: number;
    byType: Record<RiskType, number>;
    byBand: Record<string, number>;
    avgInherent: number;
    avgResidual: number;
  }> {
    const total = this.risks.length;

    const byType = this.risks.reduce(
      (acc, risk) => {
        acc[risk.type] = (acc[risk.type] || 0) + 1;
        return acc;
      },
      {} as Record<RiskType, number>
    );

    const byBand = this.risks.reduce(
      (acc, risk) => {
        if (risk.type === "qualitative") {
          const output = risk.output as any;
          acc[output.inherentBand] = (acc[output.inherentBand] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    let totalInherent = 0;
    let totalResidual = 0;
    let count = 0;

    this.risks.forEach((risk) => {
      const output = risk.output as any;
      if (risk.type === "qualitative") {
        totalInherent += output.inherentSeverity;
        totalResidual += output.residualSeverity;
      } else {
        totalInherent += output.aleInherent;
        totalResidual += output.aleResidual;
      }
      count++;
    });

    return {
      total,
      byType,
      byBand,
      avgInherent: count > 0 ? totalInherent / count : 0,
      avgResidual: count > 0 ? totalResidual / count : 0,
    };
  }
}
