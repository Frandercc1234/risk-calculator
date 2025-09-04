"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatPercent = formatPercent;
// packages/shared/src/number-format.ts
function formatCurrency(value, currency, locale, maximumFractionDigits) {
    if (currency === void 0) { currency = 'USD'; }
    if (locale === void 0) { locale = 'en-US'; }
    if (maximumFractionDigits === void 0) { maximumFractionDigits = 2; }
    var n = Number(value);
    if (!Number.isFinite(n))
        return '';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: maximumFractionDigits,
    }).format(n);
}
function formatPercent(value, locale, maximumFractionDigits) {
    if (locale === void 0) { locale = 'en-US'; }
    if (maximumFractionDigits === void 0) { maximumFractionDigits = 2; }
    var n = Number(value);
    if (!Number.isFinite(n))
        return '';
    return new Intl.NumberFormat(locale, {
        style: 'percent',
        maximumFractionDigits: maximumFractionDigits,
    }).format(n);
}
