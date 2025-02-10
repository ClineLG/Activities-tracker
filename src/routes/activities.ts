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
    const activitiesName = userA.Actitvities.filter(
      (a) => a.actual === true
    ).map((e) => e.name);
    res.status(200).json(activitiesName);
    res;
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/dayly", isAuthenticated, async (req, res) => {
  try {
    const { date } = req.query;
    const { user } = req.body;

    const dateFormat = new Date(date as string);
    const year = dateFormat.getFullYear();
    const week = weekOfYear(dateFormat);
    const day = dateFormat.getDay();

    const userA = await UserModel.findById(user._id);

    const activitiesName = [...userA.Actitvities].map((e) => e.name);

    const activitiesToday = [];
    for (let i = 0; i < activitiesName.length; i++) {
      const activity = userA.Actitvities.filter(
        (e) => e.name === activitiesName[i]
      )[0];
      const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);

      const weekObj = byYear[year].weeks.find((e: Week) => e.week === week);
      const dayObj = weekObj.days.find((d: Day) => d.day === day);

      if (dayObj.total > 0) {
        const obj = {
          name: activitiesName[i],
          total: totalHours(dayObj.total),
        };

        activitiesToday.push(obj);
      }
    }
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

    const activitiesName = [...userA.Actitvities].map((e) => e.name);

    const activitiesToday = [];
    for (let i = 0; i < activitiesName.length; i++) {
      const activity = userA.Actitvities.filter(
        (e) => e.name === activitiesName[i]
      )[0];
      const byYear = activity.activityByYear.find(
        (yearObj) => yearObj[year as string]
      );

      const weekObj = byYear[year as string].weeks.find(
        (e: Week) => e.week === Number(week)
      );

      if (weekObj.total > 0) {
        const obj = {
          name: activitiesName[i],
          total: totalHours(weekObj.total),
        };
        activitiesToday.push(obj);
      }
    }
    res.status(200).json(activitiesToday);
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

    const activitiesName = [...userA.Actitvities].map((e) => e.name);

    const activitiesToday = [];
    for (let i = 0; i < activitiesName.length; i++) {
      const activity = userA.Actitvities.filter(
        (e) => e.name === activitiesName[i]
      )[0];
      const byYear = activity.activityByYear.find(
        (yearObj) => yearObj[year as string]
      );

      if (byYear[year as string].total > 0) {
        const obj = {
          name: activitiesName[i],
          total: totalHours(byYear[year as string].total),
        };
        activitiesToday.push(obj);
      }
    }
    res.status(200).json(activitiesToday);
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

    const activitiesName = [...userA.Actitvities].map((e) => e.name);

    const activitiesToday = [];
    for (let i = 0; i < activitiesName.length; i++) {
      const activity = userA.Actitvities.filter(
        (e) => e.name === activitiesName[i]
      )[0];

      const byYear = activity.activityByYear.find(
        (yearObj) => yearObj[year as string]
      );

      const byMonth = byYear[year as string].weeks
        .filter((e: Week) => e.month === Number(month))
        .reduce((a: number, b: Week) => a + b.total, 0);

      if (byMonth > 0) {
        const obj = {
          name: activitiesName[i],
          total: totalHours(byMonth),
        };
        activitiesToday.push(obj);
      }
    }
    res.status(200).json(activitiesToday);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
