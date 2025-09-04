"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRisks = void 0;
var utils_1 = require("./utils");
var risk_utils_1 = require("./risk-utils");
function makeQualitative(input) {
    var output = (0, risk_utils_1.assessQualitativeRisk)(input);
    return __assign({ id: (0, utils_1.generateId)(), type: 'qualitative', input: input, createdAt: (0, utils_1.getCurrentTimestamp)() }, output);
}
function makeQuantitative(input) {
    var output = (0, risk_utils_1.assessQuantitativeRisk)(input);
    return __assign({ id: (0, utils_1.generateId)(), type: 'quantitative', input: input, createdAt: (0, utils_1.getCurrentTimestamp)() }, output);
}
exports.seedRisks = [
    makeQualitative({
        assetName: 'Core DB',
        threatDescription: 'SQL injection',
        likelihood: 4,
        impact: 5,
        controlEffectiveness: 0.4,
        detectionCapability: 0.6,
    }),
    makeQualitative({
        assetName: 'S3 Bucket',
        threatDescription: 'Public exposure',
        likelihood: 3,
        impact: 4,
        controlEffectiveness: 0.3,
        detectionCapability: 0.5,
    }),
    makeQuantitative({
        assetValue: 50000,
        exposureFactor: 0.3,
        annualizedRateOfOccurrence: 0.5,
        controlEffectiveness: 0.4,
        detectionCapability: 0.3,
        controlCost: 2000,
    }),
];
