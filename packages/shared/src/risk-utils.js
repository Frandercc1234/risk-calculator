"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bandFromScore = bandFromScore;
exports.getHeatmapCellColor = getHeatmapCellColor;
exports.assessQualitativeRisk = assessQualitativeRisk;
exports.assessQuantitativeRisk = assessQuantitativeRisk;
function bandFromScore(score) {
    if (score <= 5)
        return 'Low';
    if (score <= 10)
        return 'Moderate';
    if (score <= 15)
        return 'High';
    return 'Extreme';
}
function getHeatmapCellColor(l, i) {
    var s = l * i;
    var band = bandFromScore(s);
    var palette = {
        Low: '#b7e4c7',
        Moderate: '#ffd166',
        High: '#f8961e',
        Extreme: '#e63946',
    };
    return palette[band] || '#ccc';
}
function assessQualitativeRisk(input) {
    var _a, _b;
    var likelihood = input.likelihood;
    var impact = input.impact;
    var ce = (_a = input.controlEffectiveness) !== null && _a !== void 0 ? _a : 0;
    var dc = (_b = input.detectionCapability) !== null && _b !== void 0 ? _b : 0;
    var inherentSeverity = likelihood * impact;
    var residualLikelihood = Math.max(1, Math.round(likelihood * (1 - ce)));
    var residualImpact = Math.max(1, Math.round(impact * (1 - dc * 0.5)));
    var residualSeverity = residualLikelihood * residualImpact;
    return {
        inherentSeverity: inherentSeverity,
        residualLikelihood: residualLikelihood, // ← ahora coincide con el schema/tipo
        residualImpact: residualImpact, // ← ahora coincide con el schema/tipo
        residualSeverity: residualSeverity,
        inherentBand: bandFromScore(inherentSeverity),
        residualBand: bandFromScore(residualSeverity),
    };
}
function assessQuantitativeRisk(input) {
    var _a, _b, _c;
    var av = input.assetValue;
    var ef = input.exposureFactor;
    var aro = input.annualizedRateOfOccurrence;
    var cost = (_a = input.controlCost) !== null && _a !== void 0 ? _a : 0;
    var ce = (_b = input.controlEffectiveness) !== null && _b !== void 0 ? _b : 0;
    var dc = (_c = input.detectionCapability) !== null && _c !== void 0 ? _c : 0;
    var sle = av * ef;
    var aleInherent = sle * aro;
    var aleResidual = aleInherent * (1 - ce) * (1 - dc * 0.5);
    var netResidual = aleResidual + cost;
    return { sle: sle, aleInherent: aleInherent, aleResidual: aleResidual, netResidual: netResidual }; // ← ahora coincide con el schema/tipo
}
