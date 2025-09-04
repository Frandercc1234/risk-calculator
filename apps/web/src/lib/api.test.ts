import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiError } from './api';

// Mock fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('health', () => {
    it('should return health status', async () => {
      const mockResponse = { ok: true };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockResponse }),
      });

      const result = await api.health();

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/health', {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRisks', () => {
    it('should fetch risks with query parameters', async () => {
      const mockRisks = {
        data: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockRisks }),
      });

      const result = await api.getRisks({
        page: 1,
        pageSize: 10,
        type: 'qualitative',
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/risks?page=1&pageSize=10&type=qualitative',
        { headers: { 'Content-Type': 'application/json' } }
      );
      expect(result).toEqual(mockRisks);
    });
  });

  describe('createQualitativeRisk', () => {
    it('should create a qualitative risk', async () => {
      const input = {
        assetName: 'Test Asset',
        threatDescription: 'Test threat',
        likelihood: 4,
        impact: 5,
      };
      const mockRisk = {
        id: 'test-id',
        type: 'qualitative',
        input,
        output: {},
      };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockRisk }),
      });

      const result = await api.createQualitativeRisk(input);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/risks/qualitative',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );
      expect(result).toEqual(mockRisk);
    });
  });

  describe('error handling', () => {
    it('should throw ApiError for API errors', async () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { field: 'assetName' },
        },
      };
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      await expect(api.health()).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for unknown errors', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(api.health()).rejects.toThrow(ApiError);
    });
  });
});

