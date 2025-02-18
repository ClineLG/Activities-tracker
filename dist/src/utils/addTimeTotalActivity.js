"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementTimeForMultipleDays = exports.addTimeToActivity = void 0;
const calculateToMinutes_1 = __importDefault(require("../utils/calculateToMinutes"));
const weekOfYear_1 = __importDefault(require("../utils/weekOfYear"));
const User_1 = require("../models/User");
const addTimeToActivity = async (id, activityId, activityName, timeSpent, date, edit) => {
    const day = date.getDay() + 1;
    const week = (0, weekOfYear_1.default)(date);
    const year = date.getFullYear();
    const userConcerned = await User_1.UserModel.findById(id);
    if (userConcerned.ActivitiesByYear[year].total.length < 1) {
        userConcerned.ActivitiesByYear[year].total.push({
            id: activityId,
            name: activityName,
            time: timeSpent,
        });
    }
    else {
        // console.log(activityId);
        // console.log("TOTAL", userConcerned.ActivitiesByYear[year].total);
        // console.log("year", year);
        const totalByYear = userConcerned.ActivitiesByYear[year].total.find((e) => e.id === activityId);
        if (totalByYear) {
            totalByYear.time += Number(timeSpent);
        }
        else {
            userConcerned.ActivitiesByYear[year].total.push({
                id: activityId,
                name: activityName,
                time: timeSpent,
            });
        }
    }
    if (userConcerned.ActivitiesByYear[year].weeks.find((e) => e.week === week).total.length < 1) {
        userConcerned.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .total.push({ id: activityId, name: activityName, time: timeSpent });
    }
    else {
        const totalByWeek = userConcerned.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .total.find((e) => e.id === activityId);
        if (totalByWeek) {
            totalByWeek.time += Number(timeSpent);
        }
        else {
            userConcerned.ActivitiesByYear[year].weeks
                .find((e) => e.week === week)
                .total.push({ id: activityId, name: activityName, time: timeSpent });
        }
    }
    if (userConcerned.ActivitiesByYear[year].weeks
        .find((e) => e.week === week)
        .days.find((e) => e.day === day).total.length < 1) {
        userConcerned.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .days.find((e) => e.day === day)
            .total.push({ id: activityId, name: activityName, time: timeSpent });
    }
    else {
        const totalByDay = userConcerned.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .days.find((e) => e.day === day)
            .total.find((e) => e.id === activityId);
        if (totalByDay) {
            totalByDay.time += Number(timeSpent);
        }
        else {
            userConcerned.ActivitiesByYear[year].weeks
                .find((e) => e.week === week)
                .days.find((e) => e.day === day)
                .total.push({ id: activityId, name: activityName, time: timeSpent });
        }
    }
    if (!edit) {
        const newPending = userConcerned.ActitvitiesNameAndStatus.find((e) => e._id.toString() === activityId);
        newPending.pending = undefined;
    }
    userConcerned.markModified("ActivitiesByYear");
    await userConcerned.save();
};
exports.addTimeToActivity = addTimeToActivity;
const incrementTimeForMultipleDays = (startDate, endDate, id, activityId, activityName) => {
    let firstDayDate = new Date(startDate);
    const endOfFirstDay = new Date(firstDayDate);
    endOfFirstDay.setHours(23, 59, 59, 999);
    const firstDayTime = (0, calculateToMinutes_1.default)(endOfFirstDay.getTime(), startDate);
    if (firstDayTime > 0) {
        (0, exports.addTimeToActivity)(id, activityId, activityName, firstDayTime, new Date(startDate));
    }
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);
    while (currentDate < endDate) {
        (0, exports.addTimeToActivity)(id, activityId, activityName, 1440, currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    const lastDayTime = (0, calculateToMinutes_1.default)(endDate, new Date(endDate.setHours(0, 0, 0, 0)).getTime());
    if (lastDayTime > 0) {
        (0, exports.addTimeToActivity)(id, activityId, activityName, lastDayTime, endDate);
    }
};
exports.incrementTimeForMultipleDays = incrementTimeForMultipleDays;
//# sourceMappingURL=addTimeTotalActivity.js.map