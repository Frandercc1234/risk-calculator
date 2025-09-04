import {
  RiskEntry,
  RiskQueryParams,
  PaginatedResponse,
  QualitativeRiskInput,
  QuantitativeRiskInput,
  QuantitativeSimulationInput,
  SimulationScenario,
  ApiResult,
} from '@risk-calculator/shared';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.error) {
      throw new ApiError(
        data.error.code,
        data.error.message,
        data.error.details
      );
    }
    throw new ApiError('UNKNOWN_ERROR', 'An unknown error occurred');
  }

  return data.data;
}

export const api = {
  // Health check
  health: () => request<{ ok: boolean }>('/health'),

  // Risks
  getRisks: (params?: RiskQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<PaginatedResponse<RiskEntry>>(
      `/risks${query ? `?${query}` : ''}`
    );
  },

  getRisk: (id: string) => request<RiskEntry>(`/risks/${id}`),

  createQualitativeRisk: (input: QualitativeRiskInput) =>
    request<RiskEntry>('/risks/qualitative', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  createQuantitativeRisk: (input: QuantitativeRiskInput) =>
    request<RiskEntry>('/risks/quantitative', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  deleteRisk: (id: string) =>
    request<{ success: boolean }>(`/risks/${id}`, {
      method: 'DELETE',
    }),

  getStats: () => request<any>('/risks/stats'),

  // Simulation
  runQuantitativeSimulation: (input: QuantitativeSimulationInput) =>
    request<SimulationScenario[]>('/simulate/quantitative', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export { ApiError };

