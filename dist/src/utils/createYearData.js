"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createYearData = () => {
    return {
        total: [], //total all activity per year=> [{pingPong:35},{code:140}...]
        weeks: Array.from({ length: 52 }).map((_, i) => ({
            week: i + 1,
            month: Math.min(12, Math.ceil((i + 1) / 4)),
            total: [], //total all activity per week => [{pingPong:3},{code:14}...]
            days: Array.from({ length: 7 }).map((_, i) => ({
                day: i + 1,
                total: [], //total all activity per day=> [{pingPong:1},{code:1}...]
                // pending: [], //[{name:pingPong,start:170348595904}...]
                //[{pingPong:170348995904}...]
            })),
        })),
    };
};
exports.default = createYearData;
//# sourceMappingURL=createYearData.js.map