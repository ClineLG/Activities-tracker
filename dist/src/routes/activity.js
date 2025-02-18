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
// import { Week, Day, Year, User } from "../types/activityTypes";
const addTimeTotalActivity_1 = require("../utils/addTimeTotalActivity");
const router = express_1.default.Router();
router.post("/create", isAuthenticated_1.default, async (req, res) => {
    try {
        const { name, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id).select("-hash,-salt");
        const year = new Date().getFullYear();
        userConcerned.ActitvitiesNameAndStatus.push({
            name: name,
            actual: true,
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
        const { id, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id);
        //
        //
        const day = new Date().getDay();
        const week = (0, weekOfYear_1.default)(new Date());
        const year = new Date().getFullYear();
        const activity = userConcerned.ActitvitiesNameAndStatus.find((e) => e._id.toString() === id);
        activity.pending = {
            year: year,
            week: week,
            day: day,
            time: new Date().getTime(),
        };
        await userConcerned.save();
        res.status(200).json(activity.pending);
    }
    catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});
router.post("/stop", isAuthenticated_1.default, async (req, res) => {
    try {
        const { id, name, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id);
        const dayNow = new Date().getDay();
        const weekNow = (0, weekOfYear_1.default)(new Date());
        const yearNow = new Date().getFullYear();
        const timeNow = Date.now();
        console.log("weekNow", weekNow);
        const activity = userConcerned.ActitvitiesNameAndStatus.find((e) => e._id.toString() === id);
        const { time, week, day, year } = activity.pending;
        const rangeTime = (0, calculateToMinutes_1.default)(timeNow, Number(time));
        const startDate = new Date(Number(time));
        if (!userConcerned.ActivitiesByYear[startDate.getFullYear()]) {
            userConcerned.ActivitiesByYear[startDate.getFullYear()] =
                (0, createYearData_1.default)();
        }
        if (!userConcerned.ActivitiesByYear[new Date().getFullYear()]) {
            userConcerned.ActivitiesByYear[startDate.getFullYear()] =
                (0, createYearData_1.default)();
        }
        if (year === yearNow && day === dayNow && week === weekNow) {
            (0, addTimeTotalActivity_1.addTimeToActivity)(user.id, id, name, rangeTime, startDate);
        }
        else {
            (0, addTimeTotalActivity_1.incrementTimeForMultipleDays)(startDate, new Date(), user.id, id, name);
        }
        //del pending
        res.status(200).json(userConcerned);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.post("/delete", isAuthenticated_1.default, async (req, res) => {
    try {
        const { id, user } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id);
        const activity = userConcerned.ActitvitiesNameAndStatus.find((e) => e.id === id);
        activity.actual = false;
        await userConcerned.save();
        res.status(200).json({ message: "activity deleted" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
router.post("/addTime", isAuthenticated_1.default, async (req, res) => {
    try {
        const { id, date, time, user, name } = req.body;
        const userConcerned = await User_1.UserModel.findById(user._id);
        const dateEdit = new Date(date);
        if (!userConcerned.ActivitiesByYear[dateEdit.getFullYear()]) {
            userConcerned.ActivitiesByYear[dateEdit.getFullYear()] = (0, createYearData_1.default)();
            userConcerned.markModified("ActivitiesByYear");
            await userConcerned.save();
        }
        const edit = true;
        (0, addTimeTotalActivity_1.addTimeToActivity)(user._id, id, name, time, dateEdit, edit);
        res.status(201).json(userConcerned);
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});
module.exports = router;
//# sourceMappingURL=activity.js.map