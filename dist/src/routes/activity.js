"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const calculateToMinutes_1 = __importDefault(require("../utils/calculateToMinutes"));
const createYearData_1 = __importDefault(require("../utils/createYearData"));
const express_1 = __importDefault(require("express"));
const weekOfYear_1 = __importDefault(require("../utils/weekOfYear"));
const router = express_1.default.Router();
router.post("/create", isAuthenticated_1.default, async (req, res) => {
    try {
        const { name, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id).select("-hash,-salt");
        const year = new Date().getFullYear();
        userConcerned.Actitvities.push({
            name: name,
            actual: true,
            activityByYear: [(0, createYearData_1.default)(year)],
        });
        await userConcerned.save();
        res.status(201).json(userConcerned);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
router.post("/start", isAuthenticated_1.default, async (req, res) => {
    try {
        const { name, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id);
        const activity = userConcerned.Actitvities.filter((e) => e.name === name)[0];
        if (!activity) {
            return res.status(400).json({ message: "unknown activity" });
        }
        activity.pending.start = Date.now();
        const day = new Date().getDay();
        const week = (0, weekOfYear_1.default)(new Date());
        const year = new Date().getFullYear();
        const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
        if (byYear) {
            const weekObj = byYear[year].weeks.find((e) => e.week === week);
            const dayObj = weekObj.days.find((d) => d.day === day);
            dayObj.start = Date.now();
            console.log("DO", dayObj);
        }
        else {
            activity.activityByYear.push((0, createYearData_1.default)(year));
            const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
            const weekObj = byYear[year].weeks.find((e) => e.week === week);
            const dayObj = weekObj.days.find((d) => d.day === day);
            dayObj.start = Date.now();
        }
        activity.markModified("activityByYear");
        await userConcerned.save();
        res.status(200).json(userConcerned);
    }
    catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});
router.post("/stop", isAuthenticated_1.default, async (req, res) => {
    try {
        const { name, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id);
        const activity = userConcerned.Actitvities.filter((e) => e.name === name)[0];
        if (!activity) {
            return res.status(400).json({ message: "unknown activity" });
        }
        activity.pending.end = Date.now();
        const day = new Date().getDay();
        const week = (0, weekOfYear_1.default)(new Date());
        const year = new Date().getFullYear();
        const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
        if (byYear) {
            const weekObj = byYear[year].weeks.find((e) => e.week === week);
            const dayObj = weekObj.days.find((d) => d.day === day);
            if (dayObj.start !== 0) {
                dayObj.end = Date.now();
                dayObj.total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
                byYear[year].total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
                weekObj.total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
            }
            else if (dayObj.start === 0) {
                //set yesterday counter
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(23, 59, 59, 999);
                const weekObjYesterday = byYear[year].weeks.find((e) => e.week === (0, weekOfYear_1.default)(yesterday));
                const dayObjYesterday = weekObjYesterday.days.find((d) => d.day === yesterday.getDay());
                dayObjYesterday.end = yesterday.getTime();
                dayObjYesterday.total += (0, calculateToMinutes_1.default)(dayObjYesterday.start, dayObjYesterday.end);
                byYear[year].total += (0, calculateToMinutes_1.default)(dayObjYesterday.start, dayObjYesterday.end);
                weekObjYesterday.total += (0, calculateToMinutes_1.default)(dayObjYesterday.start, dayObjYesterday.end);
                // set Today counter
                dayObj.end = Date.now();
                const midnightStart = new Date();
                midnightStart.setHours(0, 0, 0, 0);
                dayObj.start = midnightStart.getTime();
                dayObj.total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
                byYear[year].total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
                weekObj.total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
            }
        }
        else {
            //create new array for the new year
            activity.activityByYear.push((0, createYearData_1.default)(year));
            //set yesterday counter
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(23, 59, 59, 999);
            const weekObjYesterday = byYear[year].weeks.find((e) => e.week === (0, weekOfYear_1.default)(yesterday));
            const dayObjYesterday = weekObjYesterday.days.find((d) => d.day === yesterday.getDay());
            dayObjYesterday.end = yesterday.getTime();
            dayObjYesterday.total += (0, calculateToMinutes_1.default)(dayObjYesterday.start, dayObjYesterday.end);
            byYear[year].total += (0, calculateToMinutes_1.default)(dayObjYesterday.start, dayObjYesterday.end);
            weekObjYesterday.total += (0, calculateToMinutes_1.default)(dayObjYesterday.start, dayObjYesterday.end);
            const weekObj = byYear[year].weeks.find((e) => e.week === week);
            const dayObj = weekObj.days.find((d) => d.day === day);
            // set Today counter
            dayObj.end = Date.now();
            const midnightStart = new Date();
            midnightStart.setHours(0, 0, 0, 0);
            dayObj.start = midnightStart.getTime();
            dayObj.total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
            byYear[year].total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
            weekObj.total += (0, calculateToMinutes_1.default)(dayObj.start, dayObj.end);
        }
        activity.markModified("activityByYear");
        await userConcerned.save();
        res.status(200).json(userConcerned);
    }
    catch (error) {
        res.status(500).json(error);
    }
});
module.exports = router;
//# sourceMappingURL=activity.js.map