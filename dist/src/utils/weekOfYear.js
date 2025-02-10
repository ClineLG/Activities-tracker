"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const weekOfYear = (date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    console.log(startOfYear);
    startOfYear.setDate(startOfYear.getDate() + (startOfYear.getDay() % 7));
    return Math.round((date.getTime() - startOfYear.getTime()) / 604_800_000);
};
exports.default = weekOfYear;
//# sourceMappingURL=weekOfYear.js.map