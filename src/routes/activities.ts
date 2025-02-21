import express from "express";
import { UserModel } from "../models/User";
import isAuthenticated from "../../middleware/isAuthenticated";
import totalHours from "../utils/totalHours";
import weekOfYear from "../utils/weekOfYear";
import { Week, Day, ActivityType, ActivityTrack } from "../types/activityTypes";
import calculateMinutes from "../utils/calculateToMinutes";
import pendingAndActivitiesTrack from "../utils/pendingAndActivitiesTrack";
import { RandomMotiv } from "../utils/randomMotiv";

const router = express.Router();

router.get("/all", isAuthenticated, async (req, res) => {
  try {
    const userA = await UserModel.findById(req.body.user._id);
    const activitiesName = userA.ActitvitiesNameAndStatus.filter(
      (a) => a.actual === true
    );

    res.status(200).json({
      user: { name: userA.username, quote: RandomMotiv() },
      activities: activitiesName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/daily", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.query;
    const { user } = req.body;
    const dateFormat = new Date(date as string);
    const year = dateFormat.getFullYear();
    const week = weekOfYear(dateFormat);
    console.log("dateformat", dateFormat);
    const day = dateFormat.getDay() === 0 ? 7 : dateFormat.getDay();
    console.log(day);
    const userA = await UserModel.findById(user._id);

    if (!userA.ActivitiesByYear[year]) {
      return res.status(500).json({ message: "no data" });
    }

    const activitiesToday = userA.ActivitiesByYear[year].weeks
      .find((e: Week) => e.week === week)
      .days.find((e: Day) => e.day === day).total;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLocal = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (dateFormat.getTime() === todayLocal) {
      const response = pendingAndActivitiesTrack(
        activitiesToday,
        userA.ActitvitiesNameAndStatus as unknown as ActivityType[]
      );
      console.log("hereIampending>>>>>response");
      return res.status(200).json(response);
    } else {
      return res.status(200).json(activitiesToday);
    }
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

    if (!userA.ActivitiesByYear[year as string]) {
      return res.status(500).json({ message: "no data" });
    }

    const activitiesWeek = userA.ActivitiesByYear[year as string].weeks.find(
      (e: Week) => e.week === Number(week)
    ).total;

    const weekNow = weekOfYear(new Date());

    if (weekNow === Number(week)) {
      const response = pendingAndActivitiesTrack(
        activitiesWeek,
        userA.ActitvitiesNameAndStatus as unknown as ActivityType[]
      );

      return res.status(200).json(response);
    } else {
      return res.status(200).json(activitiesWeek);
    }
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

    if (!userA.ActivitiesByYear[year as string]) {
      return res.status(500).json({ message: "no data" });
    }

    const activitiesYear = userA.ActivitiesByYear[year as string].total;

    const yearNow = new Date().getFullYear();

    if (yearNow === Number(year)) {
      const response = pendingAndActivitiesTrack(
        activitiesYear,
        userA.ActitvitiesNameAndStatus as unknown as ActivityType[]
      );

      return res.status(200).json(response);
    } else {
      return res.status(200).json(activitiesYear);
    }
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

    if (!userA.ActivitiesByYear[year as string]) {
      return res.status(500).json({ message: "no data" });
    }

    const weeksArr = userA.ActivitiesByYear[year as string].weeks;

    const totalMonth = weeksArr.filter((e: Week) => e.month === Number(month));
    let finalResult: ActivityTrack[] = [];

    interface Accumulator {
      [key: string]: ActivityTrack;
    }

    const result = totalMonth.reduce((acc: Accumulator, currObj: Week) => {
      currObj.total.forEach((activity: ActivityTrack) => {
        const { id, time } = activity;
        if (acc[id]) {
          acc[id].time += time;
        } else {
          acc[id] = { ...activity };
        }
      });
      return acc;
    }, {} as Accumulator);
    finalResult = Object.values(result);

    const monthNow = new Date().getMonth() + 1;

    if (monthNow === Number(month)) {
      const response = pendingAndActivitiesTrack(
        finalResult,
        userA.ActitvitiesNameAndStatus as unknown as ActivityType[]
      );

      return res.status(200).json(response);
    } else {
      return res.status(200).json(finalResult);
    }

    // res.status(200).json(finalResult);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
