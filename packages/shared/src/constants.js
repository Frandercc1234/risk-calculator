"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SORT = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGINATION = exports.HEATMAP_COLORS = exports.RISK_BAND_THRESHOLDS = exports.RISK_BANDS = void 0;
exports.RISK_BANDS = {
    LOW: { min: 1, max: 5, label: 'Low' },
    MODERATE: { min: 6, max: 10, label: 'Moderate' },
    HIGH: { min: 11, max: 15, label: 'High' },
    EXTREME: { min: 16, max: 25, label: 'Extreme' },
};
exports.RISK_BAND_THRESHOLDS = [
    { min: 1, max: 5, band: 'Low', color: '#10B981' }, // green
    { min: 6, max: 10, band: 'Moderate', color: '#F59E0B' }, // yellow
    { min: 11, max: 15, band: 'High', color: '#EF4444' }, // red
    { min: 16, max: 25, band: 'Extreme', color: '#7C2D12' }, // dark red
];
exports.HEATMAP_COLORS = {
    Low: '#10B981', // green
    Moderate: '#F59E0B', // yellow
    High: '#EF4444', // red
    Extreme: '#7C2D12', // dark red
};
exports.DEFAULT_PAGINATION = {
    page: 1,
    pageSize: 10,
};
exports.MAX_PAGE_SIZE = 100;
exports.DEFAULT_SORT = {
    sortBy: 'createdAt',
    order: 'desc',
};
