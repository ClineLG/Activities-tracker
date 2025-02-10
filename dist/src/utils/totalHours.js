"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const totalHours = (time) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};
exports.default = totalHours;
//# sourceMappingURL=totalHours.js.map