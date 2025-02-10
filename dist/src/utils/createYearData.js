"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createYearData = (year) => {
    return {
        [year]: {
            total: 0,
            weeks: Array.from({ length: 52 }).map((_, i) => ({
                week: i + 1,
                month: Math.min(12, Math.ceil((i + 1) / 4)),
                total: 0,
                days: Array.from({ length: 7 }).map((_, i) => ({
                    day: i + 1,
                    total: 0,
                    start: 0,
                    end: 0,
                })),
            })),
        },
    };
};
exports.default = createYearData;
//# sourceMappingURL=createYearData.js.map