import express from "express";
import { UserModel } from "../models/User";
import isAuthenticated from "../../middleware/isAuthenticated";
import totalHours from "../utils/totalHours";
import weekOfYear from "../utils/weekOfYear";
import { Week, Day } from "../types/activityTypes";

const router = express.Router();

router.get("/all", isAuthenticated, async (req, res) => {
  try {
    const userA = await UserModel.findById(req.body.user._id);
    const activitiesName = userA.ActitvitiesNameAndStatus.filter(
      (a) => a.actual === true
    );

    res.status(200).json(activitiesName);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/dayly", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.query;
    const { user } = req.body;
    // console.log("Daily Date", date);
    const dateFormat = new Date(date as string);
    // console.log(dateFormat);
    const year = dateFormat.getFullYear();
    const week = weekOfYear(dateFormat);
    const day = dateFormat.getDay();

    const userA = await UserModel.findById(user._id);
    const activitiesToday = userA.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day).total;
    res.status(200).json(activitiesToday);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/weekly", isAuthenticated, async (req, res) => {
  try {
    const { year, week } = req.query;
    const { user } = req.body;

    const userA = await UserModel.findById(user._id);

    const activitiesWeek = userA.ActivitiesByYear[year as string].weeks.find(
      (e: Week) => e.week === Number(week)
    ).total;
    res.status(200).json(activitiesWeek);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/year", isAuthenticated, async (req, res) => {
  try {
    const { year } = req.query;
    const { user } = req.body;

    const userA = await UserModel.findById(user._id);

    const activitiesYear = userA.ActivitiesByYear[year as string].total;

    res.status(200).json(activitiesYear);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/month", isAuthenticated, async (req, res) => {
  try {
    const { year, month } = req.query;
    const { user } = req.body;

    const userA = await UserModel.findById(user._id);

    const weeksArr = userA.ActivitiesByYear[year as string].weeks;

    const totalMonth = weeksArr.filter((e: Week) => e.month === Number(month));

    res.status(200).json(totalMonth);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
