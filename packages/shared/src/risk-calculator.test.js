"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var risk_calculator_1 = require("./risk-calculator");
(0, vitest_1.describe)('Risk Calculator', function () {
    (0, vitest_1.describe)('bandFromScore', function () {
        (0, vitest_1.it)('should return correct bands for different scores', function () {
            (0, vitest_1.expect)((0, risk_calculator_1.bandFromScore)(3)).toBe('Low');
            (0, vitest_1.expect)((0, risk_calculator_1.bandFromScore)(8)).toBe('Moderate');
            (0, vitest_1.expect)((0, risk_calculator_1.bandFromScore)(13)).toBe('High');
            (0, vitest_1.expect)((0, risk_calculator_1.bandFromScore)(20)).toBe('Extreme');
        });
    });
    (0, vitest_1.describe)('getHeatmapCellColor', function () {
        (0, vitest_1.it)('should return correct colors for different likelihood/impact combinations', function () {
            (0, vitest_1.expect)((0, risk_calculator_1.getHeatmapCellColor)(1, 1)).toBe('#10B981'); // Low
            (0, vitest_1.expect)((0, risk_calculator_1.getHeatmapCellColor)(2, 3)).toBe('#F59E0B'); // Moderate
            (0, vitest_1.expect)((0, risk_calculator_1.getHeatmapCellColor)(3, 4)).toBe('#EF4444'); // High
            (0, vitest_1.expect)((0, risk_calculator_1.getHeatmapCellColor)(5, 5)).toBe('#7C2D12'); // Extreme
        });
    });
    (0, vitest_1.describe)('assessQualitativeRisk', function () {
        (0, vitest_1.it)('should calculate inherent severity correctly', function () {
            var input = {
                assetName: 'Test Asset',
                threatDescription: 'Test threat',
                likelihood: 4,
                impact: 5,
            };
            var result = (0, risk_calculator_1.assessQualitativeRisk)(input);
            (0, vitest_1.expect)(result.inherentSeverity).toBe(20);
            (0, vitest_1.expect)(result.inherentBand).toBe('Extreme');
        });
        (0, vitest_1.it)('should calculate residual values with controls', function () {
            var input = {
                assetName: 'Test Asset',
                threatDescription: 'Test threat',
                likelihood: 4,
                impact: 5,
                controlEffectiveness: 0.5,
                detectionCapability: 0.6,
            };
            var result = (0, risk_calculator_1.assessQualitativeRisk)(input);
            (0, vitest_1.expect)(result.residualLikelihood).toBe(2); // 4 * (1 - 0.5)
            (0, vitest_1.expect)(result.residualImpact).toBe(3.5); // 5 * (1 - 0.6 * 0.5)
            (0, vitest_1.expect)(result.residualSeverity).toBe(6); // round(2) * round(3.5) = 2 * 3
            (0, vitest_1.expect)(result.residualBand).toBe('Moderate');
        });
        (0, vitest_1.it)('should cap residual impact to minimum of 1', function () {
            var input = {
                assetName: 'Test Asset',
                threatDescription: 'Test threat',
                likelihood: 1,
                impact: 1,
                detectionCapability: 1,
            };
            var result = (0, risk_calculator_1.assessQualitativeRisk)(input);
            (0, vitest_1.expect)(result.residualImpact).toBe(1);
        });
    });
    (0, vitest_1.describe)('assessQuantitativeRisk', function () {
        (0, vitest_1.it)('should calculate SLE and ALE correctly', function () {
            var input = {
                assetValue: 1000000,
                exposureFactor: 0.3,
                annualizedRateOfOccurrence: 2.0,
            };
            var result = (0, risk_calculator_1.assessQuantitativeRisk)(input);
            (0, vitest_1.expect)(result.sle).toBe(300000); // 1000000 * 0.3
            (0, vitest_1.expect)(result.aleInherent).toBe(600000); // 300000 * 2.0
            (0, vitest_1.expect)(result.aleResidual).toBe(600000); // No controls
            (0, vitest_1.expect)(result.netRisk).toBe(600000); // No control costs
        });
        (0, vitest_1.it)('should apply controls correctly', function () {
            var input = {
                assetValue: 1000000,
                exposureFactor: 0.3,
                annualizedRateOfOccurrence: 2.0,
                controlCost: 50000,
                controlEffectiveness: 0.5,
                detectionCapability: 0.4,
            };
            var result = (0, risk_calculator_1.assessQuantitativeRisk)(input);
            (0, vitest_1.expect)(result.sle).toBe(300000);
            (0, vitest_1.expect)(result.aleInherent).toBe(600000);
            (0, vitest_1.expect)(result.aleResidual).toBe(180000); // 600000 * (1 - 0.5) * (1 - 0.4 * 0.5)
            (0, vitest_1.expect)(result.netRisk).toBe(230000); // 180000 + 50000
        });
    });
    (0, vitest_1.describe)('runQuantitativeSimulation', function () {
        (0, vitest_1.it)('should generate correct number of scenarios', function () {
            var input = {
                assetValue: 1000000,
                exposureFactor: 0.3,
                annualizedRateOfOccurrence: 2.0,
                controlEffectivenessRange: [0, 1],
                detectionCapabilityRange: [0, 1],
                scenarios: 5,
            };
            var results = (0, risk_calculator_1.runQuantitativeSimulation)(input);
            (0, vitest_1.expect)(results).toHaveLength(5);
        });
        (0, vitest_1.it)('should vary control parameters across scenarios', function () {
            var input = {
                assetValue: 1000000,
                exposureFactor: 0.3,
                annualizedRateOfOccurrence: 2.0,
                controlEffectivenessRange: [0, 1],
                detectionCapabilityRange: [0, 1],
                scenarios: 3,
            };
            var results = (0, risk_calculator_1.runQuantitativeSimulation)(input);
            (0, vitest_1.expect)(results[0].controlEffectiveness).toBe(0);
            (0, vitest_1.expect)(results[1].controlEffectiveness).toBe(0.5);
            (0, vitest_1.expect)(results[2].controlEffectiveness).toBe(1);
        });
    });
});
