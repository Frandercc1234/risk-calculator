"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.clamp = clamp;
exports.roundTo = roundTo;
exports.calculatePagination = calculatePagination;
exports.sortBy = sortBy;
exports.debounce = debounce;
var uuid_1 = require("uuid");
function generateId() {
    return (0, uuid_1.v4)();
}
function getCurrentTimestamp() {
    return new Date().toISOString();
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function roundTo(value, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
function calculatePagination(page, pageSize, total) {
    var totalPages = Math.ceil(total / pageSize);
    var offset = (page - 1) * pageSize;
    return {
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: totalPages,
        offset: offset,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}
function sortBy(array, key, order) {
    if (order === void 0) { order = 'asc'; }
    return __spreadArray([], array, true).sort(function (a, b) {
        var aVal = a[key];
        var bVal = b[key];
        if (aVal < bVal)
            return order === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return order === 'asc' ? 1 : -1;
        return 0;
    });
}
function debounce(func, wait) {
    var timeout;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () { return func.apply(void 0, args); }, wait);
    };
}
