"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const totalHours_1 = __importDefault(require("../utils/totalHours"));
const express_1 = __importDefault(require("express"));
const weekOfYear_1 = __importDefault(require("../utils/weekOfYear"));
const router = express_1.default.Router();
router.get("/dayly", isAuthenticated_1.default, async (req, res) => {
    try {
        const { date } = req.query;
        const { user } = req.body;
        const dateFormat = new Date(date);
        const year = dateFormat.getFullYear();
        const week = (0, weekOfYear_1.default)(dateFormat);
        const day = dateFormat.getDay();
        const userA = await User_1.UserModel.findById(user._id);
        const activitiesName = [...userA.Actitvities].map((e) => e.name);
        const activitiesToday = [];
        for (let i = 0; i < activitiesName.length; i++) {
            const activity = userA.Actitvities.filter((e) => e.name === activitiesName[i])[0];
            const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
            const weekObj = byYear[year].weeks.find((e) => e.week === week);
            const dayObj = weekObj.days.find((d) => d.day === day);
            if (dayObj.total > 0) {
                const obj = {
                    name: activitiesName[i],
                    total: (0, totalHours_1.default)(dayObj.total),
                };
                activitiesToday.push(obj);
            }
        }
        res.status(200).json(activitiesToday);
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
        const activitiesName = [...userA.Actitvities].map((e) => e.name);
        const activitiesToday = [];
        for (let i = 0; i < activitiesName.length; i++) {
            const activity = userA.Actitvities.filter((e) => e.name === activitiesName[i])[0];
            const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
            const weekObj = byYear[year].weeks.find((e) => e.week === Number(week));
            if (weekObj.total > 0) {
                const obj = {
                    name: activitiesName[i],
                    total: (0, totalHours_1.default)(weekObj.total),
                };
                activitiesToday.push(obj);
            }
        }
        res.status(200).json(activitiesToday);
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
        const activitiesName = [...userA.Actitvities].map((e) => e.name);
        const activitiesToday = [];
        for (let i = 0; i < activitiesName.length; i++) {
            const activity = userA.Actitvities.filter((e) => e.name === activitiesName[i])[0];
            const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
            if (byYear[year].total > 0) {
                const obj = {
                    name: activitiesName[i],
                    total: (0, totalHours_1.default)(byYear[year].total),
                };
                activitiesToday.push(obj);
            }
        }
        res.status(200).json(activitiesToday);
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
        const activitiesName = [...userA.Actitvities].map((e) => e.name);
        const activitiesToday = [];
        for (let i = 0; i < activitiesName.length; i++) {
            const activity = userA.Actitvities.filter((e) => e.name === activitiesName[i])[0];
            const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
            const byMonth = byYear[year].weeks
                .filter((e) => e.month === Number(month))
                .reduce((a, b) => a + b.total, 0);
            if (byMonth > 0) {
                const obj = {
                    name: activitiesName[i],
                    total: (0, totalHours_1.default)(byMonth),
                };
                activitiesToday.push(obj);
            }
        }
        res.status(200).json(activitiesToday);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
module.exports = router;
//# sourceMappingURL=activities.js.map