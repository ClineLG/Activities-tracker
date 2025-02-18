"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const weekOfYear_1 = __importDefault(require("../utils/weekOfYear"));
const pendingAndActivitiesTrack_1 = __importDefault(require("../utils/pendingAndActivitiesTrack"));
const router = express_1.default.Router();
router.get("/all", isAuthenticated_1.default, async (req, res) => {
    try {
        const userA = await User_1.UserModel.findById(req.body.user._id);
        const activitiesName = userA.ActitvitiesNameAndStatus.filter((a) => a.actual === true);
        res.status(200).json(activitiesName);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.get("/daily", isAuthenticated_1.default, async (req, res) => {
    try {
        const { date } = req.query;
        const { user } = req.body;
        const dateFormat = new Date(date);
        const year = dateFormat.getFullYear();
        const week = (0, weekOfYear_1.default)(dateFormat);
        const day = dateFormat.getDay() + 1;
        const userA = await User_1.UserModel.findById(user._id);
        if (!userA.ActivitiesByYear[year]) {
            return res.status(500).json({ message: "no data" });
        }
        const activitiesToday = userA.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .days.find((e) => e.day === day).total;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLocal = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        if (dateFormat.getTime() === todayLocal) {
            const response = (0, pendingAndActivitiesTrack_1.default)(activitiesToday, userA.ActitvitiesNameAndStatus);
            return res.status(200).json(response);
        }
        else {
            return res.status(200).json(activitiesToday);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.get("/weekly", isAuthenticated_1.default, async (req, res) => {
    try {
        const { year, week } = req.query;
        const { user } = req.body;
        const userA = await User_1.UserModel.findById(user._id);
        if (!userA.ActivitiesByYear[year]) {
            return res.status(500).json({ message: "no data" });
        }
        const activitiesWeek = userA.ActivitiesByYear[year].weeks.find((e) => e.week === Number(week)).total;
        const weekNow = (0, weekOfYear_1.default)(new Date());
        if (weekNow === Number(week)) {
            const response = (0, pendingAndActivitiesTrack_1.default)(activitiesWeek, userA.ActitvitiesNameAndStatus);
            return res.status(200).json(response);
        }
        else {
            return res.status(200).json(activitiesWeek);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.get("/year", isAuthenticated_1.default, async (req, res) => {
    try {
        const { year } = req.query;
        const { user } = req.body;
        const userA = await User_1.UserModel.findById(user._id);
        if (!userA.ActivitiesByYear[year]) {
            return res.status(500).json({ message: "no data" });
        }
        const activitiesYear = userA.ActivitiesByYear[year].total;
        const yearNow = new Date().getFullYear();
        if (yearNow === Number(year)) {
            const response = (0, pendingAndActivitiesTrack_1.default)(activitiesYear, userA.ActitvitiesNameAndStatus);
            return res.status(200).json(response);
        }
        else {
            return res.status(200).json(activitiesYear);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.get("/month", isAuthenticated_1.default, async (req, res) => {
    try {
        const { year, month } = req.query;
        const { user } = req.body;
        const userA = await User_1.UserModel.findById(user._id);
        if (!userA.ActivitiesByYear[year]) {
            return res.status(500).json({ message: "no data" });
        }
        const weeksArr = userA.ActivitiesByYear[year].weeks;
        const totalMonth = weeksArr.filter((e) => e.month === Number(month));
        let finalResult = [];
        const result = totalMonth.reduce((acc, currObj) => {
            currObj.total.forEach((activity) => {
                const { id, time } = activity;
                if (acc[id]) {
                    acc[id].time += time;
                }
                else {
                    acc[id] = { ...activity };
                }
            });
            return acc;
        }, {});
        finalResult = Object.values(result);
        const monthNow = new Date().getMonth() + 1;
        if (monthNow === Number(month)) {
            const response = (0, pendingAndActivitiesTrack_1.default)(finalResult, userA.ActitvitiesNameAndStatus);
            return res.status(200).json(response);
        }
        else {
            return res.status(200).json(finalResult);
        }
        // res.status(200).json(finalResult);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
module.exports = router;
//# sourceMappingURL=activities.js.map