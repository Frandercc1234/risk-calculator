import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  RiskQueryParams,
  QualitativeRiskInput,
  QuantitativeRiskInput,
  QuantitativeSimulationInput,
  ApiResult,
  PaginatedResponse,
  RiskEntry,
} from "@risk-calculator/shared";
import {
  qualitativeRiskInputSchema,
  quantitativeRiskInputSchema,
  quantitativeSimulationInputSchema,
  riskQuerySchema, // ✅
} from "@risk-calculator/shared";

import { RisksService } from "./risks.service";

type SimStats = {
  iterations: number;
  mean: number;
  min: number;
  max: number;
};

@Controller("risks")
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Get()
  async findAll(
    @Query() query: RiskQueryParams
  ): Promise<ApiResult<PaginatedResponse<RiskEntry>>> {
    try {
      const validatedQuery = riskQuerySchema.parse(query);
      const result = await this.risksService.findAll(validatedQuery);
      return { ok: true, data: result };
    } catch (error) {
      throw new HttpException(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: error,
          },
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get("stats")
  async getStats(): Promise<ApiResult<any>> {
    try {
      const stats = await this.risksService.getStats();
      return { ok: true, data: stats };
    } catch (error) {
      throw new HttpException(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get statistics",
            details: error,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<ApiResult<RiskEntry>> {
    try {
      const risk = await this.risksService.findById(id);
      if (!risk) {
        throw new HttpException(
          {
            error: {
              code: "NOT_FOUND",
              message: "Risk not found",
            },
          },
          HttpStatus.NOT_FOUND
        );
      }
      return { ok: true, data: risk };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to get risk",
            details: error,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("qualitative")
  async createQualitative(
    @Body() body: QualitativeRiskInput
  ): Promise<ApiResult<RiskEntry>> {
    try {
      const validatedInput = qualitativeRiskInputSchema.parse(body);
      const risk = await this.risksService.createQualitative(validatedInput);
      return { ok: true, data: risk };
    } catch (error) {
      throw new HttpException(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid qualitative risk input",
            details: error,
          },
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("quantitative")
  async createQuantitative(
    @Body() body: QuantitativeRiskInput
  ): Promise<ApiResult<RiskEntry>> {
    try {
      const validatedInput = quantitativeRiskInputSchema.parse(body);
      const risk = await this.risksService.createQuantitative(validatedInput);
      return { ok: true, data: risk };
    } catch (error) {
      throw new HttpException(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid quantitative risk input",
            details: error,
          },
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(":id")
  async delete(
    @Param("id") id: string
  ): Promise<ApiResult<{ success: boolean }>> {
    try {
      const success = await this.risksService.delete(id);
      if (!success) {
        throw new HttpException(
          {
            error: {
              code: "NOT_FOUND",
              message: "Risk not found",
            },
          },
          HttpStatus.NOT_FOUND
        );
      }
      return { ok: true, data: { success: true } };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to delete risk",
            details: error,
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

@Controller("simulate")
export class SimulationController {
  constructor(private readonly risksService: RisksService) {}

  @Post("quantitative")
  async runQuantitativeSimulation(
    @Body() body: QuantitativeSimulationInput
  ): Promise<ApiResult<SimStats>> {
    try {
      const validatedInput = quantitativeSimulationInputSchema.parse(body);
      const stats = await this.risksService.runSimulation(validatedInput); // ← debe devolver {iterations,mean,min,max}
      return { ok: true, data: stats };
    } catch (error) {
      throw new HttpException(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid simulation input",
            details: error,
          },
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
