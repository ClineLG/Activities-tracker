"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const isAuthenticated_1 = __importDefault(require("../../middleware/isAuthenticated"));
const weekOfYear_1 = __importDefault(require("../utils/weekOfYear"));
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
router.get("/dayly", isAuthenticated_1.default, async (req, res) => {
    try {
        const { date } = req.query;
        const { user } = req.body;
        // console.log("Daily Date", date);
        const dateFormat = new Date(date);
        // console.log(dateFormat);
        const year = dateFormat.getFullYear();
        const week = (0, weekOfYear_1.default)(dateFormat);
        const day = dateFormat.getDay();
        const userA = await User_1.UserModel.findById(user._id);
        const activitiesToday = userA.ActivitiesByYear[year].weeks
            .find((e) => e.week === week)
            .days.find((e) => e.day === day).total;
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
        const activitiesWeek = userA.ActivitiesByYear[year].weeks.find((e) => e.week === Number(week)).total;
        res.status(200).json(activitiesWeek);
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
        const activitiesYear = userA.ActivitiesByYear[year].total;
        res.status(200).json(activitiesYear);
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
        const weeksArr = userA.ActivitiesByYear[year].weeks;
        const totalMonth = weeksArr.filter((e) => e.month === Number(month));
        res.status(200).json(totalMonth);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
module.exports = router;
//# sourceMappingURL=activities.js.map