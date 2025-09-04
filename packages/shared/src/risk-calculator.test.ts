import { describe, it, expect } from 'vitest';
import {
  assessQualitativeRisk,
  assessQuantitativeRisk,
  bandFromScore,
  getHeatmapCellColor,
  runQuantitativeSimulation,
} from './risk-calculator';

describe('Risk Calculator', () => {
  describe('bandFromScore', () => {
    it('should return correct bands for different scores', () => {
      expect(bandFromScore(3)).toBe('Low');
      expect(bandFromScore(8)).toBe('Moderate');
      expect(bandFromScore(13)).toBe('High');
      expect(bandFromScore(20)).toBe('Extreme');
    });
  });

  describe('getHeatmapCellColor', () => {
    it('should return correct colors for different likelihood/impact combinations', () => {
      expect(getHeatmapCellColor(1, 1)).toBe('#10B981'); // Low
      expect(getHeatmapCellColor(2, 3)).toBe('#F59E0B'); // Moderate
      expect(getHeatmapCellColor(3, 4)).toBe('#EF4444'); // High
      expect(getHeatmapCellColor(5, 5)).toBe('#7C2D12'); // Extreme
    });
  });

  describe('assessQualitativeRisk', () => {
    it('should calculate inherent severity correctly', () => {
      const input = {
        assetName: 'Test Asset',
        threatDescription: 'Test threat',
        likelihood: 4,
        impact: 5,
      };

      const result = assessQualitativeRisk(input);
      expect(result.inherentSeverity).toBe(20);
      expect(result.inherentBand).toBe('Extreme');
    });

    it('should calculate residual values with controls', () => {
      const input = {
        assetName: 'Test Asset',
        threatDescription: 'Test threat',
        likelihood: 4,
        impact: 5,
        controlEffectiveness: 0.5,
        detectionCapability: 0.6,
      };

      const result = assessQualitativeRisk(input);
      expect(result.residualLikelihood).toBe(2); // 4 * (1 - 0.5)
      expect(result.residualImpact).toBe(3.5); // 5 * (1 - 0.6 * 0.5)
      expect(result.residualSeverity).toBe(6); // round(2) * round(3.5) = 2 * 3
      expect(result.residualBand).toBe('Moderate');
    });

    it('should cap residual impact to minimum of 1', () => {
      const input = {
        assetName: 'Test Asset',
        threatDescription: 'Test threat',
        likelihood: 1,
        impact: 1,
        detectionCapability: 1,
      };

      const result = assessQualitativeRisk(input);
      expect(result.residualImpact).toBe(1);
    });
  });

  describe('assessQuantitativeRisk', () => {
    it('should calculate SLE and ALE correctly', () => {
      const input = {
        assetValue: 1000000,
        exposureFactor: 0.3,
        annualizedRateOfOccurrence: 2.0,
      };

      const result = assessQuantitativeRisk(input);
      expect(result.sle).toBe(300000); // 1000000 * 0.3
      expect(result.aleInherent).toBe(600000); // 300000 * 2.0
      expect(result.aleResidual).toBe(600000); // No controls
      expect(result.netRisk).toBe(600000); // No control costs
    });

    it('should apply controls correctly', () => {
      const input = {
        assetValue: 1000000,
        exposureFactor: 0.3,
        annualizedRateOfOccurrence: 2.0,
        controlCost: 50000,
        controlEffectiveness: 0.5,
        detectionCapability: 0.4,
      };

      const result = assessQuantitativeRisk(input);
      expect(result.sle).toBe(300000);
      expect(result.aleInherent).toBe(600000);
      expect(result.aleResidual).toBe(180000); // 600000 * (1 - 0.5) * (1 - 0.4 * 0.5)
      expect(result.netRisk).toBe(230000); // 180000 + 50000
    });
  });

  describe('runQuantitativeSimulation', () => {
    it('should generate correct number of scenarios', () => {
      const input = {
        assetValue: 1000000,
        exposureFactor: 0.3,
        annualizedRateOfOccurrence: 2.0,
        controlEffectivenessRange: [0, 1],
        detectionCapabilityRange: [0, 1],
        scenarios: 5,
      };

      const results = runQuantitativeSimulation(input);
      expect(results).toHaveLength(5);
    });

    it('should vary control parameters across scenarios', () => {
      const input = {
        assetValue: 1000000,
        exposureFactor: 0.3,
        annualizedRateOfOccurrence: 2.0,
        controlEffectivenessRange: [0, 1],
        detectionCapabilityRange: [0, 1],
        scenarios: 3,
      };

      const results = runQuantitativeSimulation(input);
      expect(results[0].controlEffectiveness).toBe(0);
      expect(results[1].controlEffectiveness).toBe(0.5);
      expect(results[2].controlEffectiveness).toBe(1);
    });
  });
});

