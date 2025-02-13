import { UserModel } from "../models/User";
import isAuthenticated from "../../middleware/isAuthenticated";
import calculateMinutes from "../utils/calculateToMinutes";
import createYearData from "../utils/createYearData";
import express from "express";
import weekOfYear from "../utils/weekOfYear";
// import { Week, Day, Year, User } from "../types/activityTypes";
import {
  addTimeToActivity,
  incrementTimeForMultipleDays,
} from "../utils/addTimeTotalActivity";

const router = express.Router();

router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id).select(
      "-hash,-salt"
    );

    const year = new Date().getFullYear();

    userConcerned.ActitvitiesNameAndStatus.push({
      name: name,
      actual: true,
    });

    await userConcerned.save();
    res.status(201).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/start", isAuthenticated, async (req, res) => {
  try {
    console.log("Start");
    const { id, user } = req.body;
    const userConcerned = await UserModel.findById(user._id);
    //
    //
    const day = new Date().getDay();
    const week = weekOfYear(new Date());
    const year = new Date().getFullYear();
    userConcerned.pending.push({
      id: id,
      year: year,
      week: week,
      day: day,
      time: new Date().getTime(),
    });
    await userConcerned.save();

    res.status(200).json(userConcerned.pending);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.post("/stop", isAuthenticated, async (req, res) => {
  try {
    const { id, name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id);

    const dayNow = new Date().getDay();
    const weekNow = weekOfYear(new Date());
    const yearNow = new Date().getFullYear();

    const timeNow = Date.now();

    const activity = userConcerned.pending.find((e) => e.id === id);

    const { time, week, day, year } = activity;
    const rangeTime = calculateMinutes(timeNow, Number(time));
    const startDate = new Date(Number(time));

    if (!userConcerned.ActivitiesByYear[startDate.getFullYear()]) {
      userConcerned.ActivitiesByYear[startDate.getFullYear()] =
        createYearData();
    }
    if (!userConcerned.ActivitiesByYear[new Date().getFullYear()]) {
      userConcerned.ActivitiesByYear[startDate.getFullYear()] =
        createYearData();
    }

    if (year === yearNow && day === dayNow && week === weekNow) {
      addTimeToActivity(user.id, id, name, rangeTime, startDate);
    } else {
      incrementTimeForMultipleDays(
        startDate,
        new Date(),
        user.id,
        id,
        name,
        rangeTime
      );
    }
    res.status(200).json(userConcerned);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
router.post("/delete", isAuthenticated, async (req, res) => {
  try {
    const { id, user } = req.body;
    console.log(id);
    const userConcerned = await UserModel.findById(user._id);

    const activity = userConcerned.ActitvitiesNameAndStatus.find(
      (e) => e._id.toString() === id
    );
    activity.actual = false;
    await userConcerned.save();
    res.status(200).json({ message: "activity deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
module.exports = router;
