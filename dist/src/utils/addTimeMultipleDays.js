"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementTimeForMultipleDays = void 0;
const calculateToMinutes_1 = __importDefault(require("./calculateToMinutes"));
const weekOfYear_1 = __importDefault(require("./weekOfYear"));
const addTimeToActivity = (userConcerned, activityId, activityName, timeSpent, date) => {
    const day = date.getDate();
    const week = (0, weekOfYear_1.default)(date);
    const year = date.getFullYear();
    // Update totals for year
    const totalByYear = userConcerned.ActivitiesByYear[year].total.find((e) => e.name === activityId);
    if (totalByYear) {
        totalByYear.time += timeSpent;
    }
    else {
        userConcerned.ActivitiesByYear[year].total.push({
            id: activityId,
            name: activityName,
            time: timeSpent,
        });
    }
    // Update totals for week
    const totalByWeek = userConcerned.ActivitiesByYear[year].weeks
        .find((e) => e.week === week)
        .total.find((e) => e.name === activityId);
    if (totalByWeek) {
        totalByWeek.time += timeSpent;
    }
    else {
        userConcerned.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .total.push({ id: activityId, name: activityName, time: timeSpent });
    }
    // Update totals for day
    const totalByDay = userConcerned.ActivitiesByYear[year].weeks
        .find((e) => e.week === week)
        .days.find((e) => e.day === day)
        .total.find((e) => e.name === activityId);
    if (totalByDay) {
        totalByDay.time += timeSpent;
    }
    else {
        userConcerned.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .days.find((e) => e.day === day)
            .total.push({ id: activityId, name: activityName, time: timeSpent });
    }
};
const incrementTimeForMultipleDays = (startDate, endDate, userConcerned, activityId, activityName, totalTimeSpent) => {
    let currentDate = new Date(startDate);
    // Calculate time for the first day (partial day)
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)); // Midnight start of the current day
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)); // End of the current day
    // Time for the first day (from the start of the activity to midnight)
    const firstDayTime = (0, calculateToMinutes_1.default)(endOfDay.getTime(), startDate);
    if (firstDayTime > 0) {
        // Add time for the first day
        addTimeToActivity(userConcerned, activityId, activityName, firstDayTime, startDate);
    }
    // Move to the next day
    currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1); // Next day
    // Loop over the full days between start and end date
    while (currentDate < endDate) {
        const day = currentDate.getDate();
        const week = (0, weekOfYear_1.default)(currentDate);
        const year = currentDate.getFullYear();
        addTimeToActivity(userConcerned, activityId, activityName, 1440, currentDate); // Add full 24 hours (1440 minutes) for full days
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
    // Calculate the time for the last day (from midnight to the time the activity ends)
    const lastDayTime = (0, calculateToMinutes_1.default)(endDate, new Date(endDate.setHours(23, 59, 59, 999)).getTime()); // Time from midnight to end
    if (lastDayTime > 0) {
        // Add time for the last day
        addTimeToActivity(userConcerned, activityId, activityName, lastDayTime, endDate);
    }
};
exports.incrementTimeForMultipleDays = incrementTimeForMultipleDays;
//# sourceMappingURL=addTimeMultipleDays.js.map