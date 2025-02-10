import { UserModel } from "../models/User";
import isAuthenticated from "../../middleware/isAuthenticated";
import calculateMinutes from "../utils/calculateToMinutes";
import createYearData from "../utils/createYearData";
import express from "express";
import weekOfYear from "../utils/weekOfYear";
import { Week, Day, Year, Activity } from "../types/activityTypes";

const router = express.Router();

router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id).select(
      "-hash,-salt"
    );

    const year = new Date().getFullYear();

    userConcerned.Actitvities.push({
      name: name,
      actual: true,
      activityByYear: [createYearData(year)],
    });

    await userConcerned.save();
    res.status(201).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/start", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id);

    const activity = userConcerned.Actitvities.filter(
      (e) => e.name === name
    )[0];
    if (!activity) {
      return res.status(400).json({ message: "unknown activity" });
    }

    activity.pending.start = Date.now();

    const day = new Date().getDay();
    const week = weekOfYear(new Date());
    const year = new Date().getFullYear();

    const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);

    if (byYear) {
      const weekObj = byYear[year].weeks.find((e: Week) => e.week === week);

      const dayObj = weekObj.days.find((d: Day) => d.day === day);
      dayObj.start = Date.now();
      console.log("DO", dayObj);
    } else {
      activity.activityByYear.push(createYearData(year));

      const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);
      const weekObj = byYear[year].weeks.find((e: Week) => e.week === week);

      const dayObj = weekObj.days.find((d: Day) => d.day === day);
      dayObj.start = Date.now();
    }
    activity.markModified("activityByYear");
    await userConcerned.save();

    res.status(200).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});

router.post("/stop", isAuthenticated, async (req, res) => {
  try {
    const { name, user } = req.body;
    const userConcerned = await UserModel.findById(user._id);

    const activity = userConcerned.Actitvities.filter(
      (e) => e.name === name
    )[0];

    if (!activity) {
      return res.status(400).json({ message: "unknown activity" });
    }

    activity.pending.end = Date.now();

    const day = new Date().getDay();
    const week = weekOfYear(new Date());
    const year = new Date().getFullYear();

    const byYear = activity.activityByYear.find((yearObj) => yearObj[year]);

    if (byYear) {
      const weekObj = byYear[year].weeks.find((e: Week) => e.week === week);

      const dayObj = weekObj.days.find((d: Day) => d.day === day);

      if (dayObj.start !== 0) {
        dayObj.end = Date.now();
        dayObj.total += calculateMinutes(dayObj.start, dayObj.end);
        byYear[year].total += calculateMinutes(dayObj.start, dayObj.end);
        weekObj.total += calculateMinutes(dayObj.start, dayObj.end);
      } else if (dayObj.start === 0) {
        //set yesterday counter
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);

        const weekObjYesterday = byYear[year].weeks.find(
          (e: Week) => e.week === weekOfYear(yesterday)
        );
        const dayObjYesterday = weekObjYesterday.days.find(
          (d: Day) => d.day === yesterday.getDay()
        );

        dayObjYesterday.end = yesterday.getTime();
        dayObjYesterday.total += calculateMinutes(
          dayObjYesterday.start,
          dayObjYesterday.end
        );
        byYear[year].total += calculateMinutes(
          dayObjYesterday.start,
          dayObjYesterday.end
        );
        weekObjYesterday.total += calculateMinutes(
          dayObjYesterday.start,
          dayObjYesterday.end
        );

        // set Today counter
        dayObj.end = Date.now();
        const midnightStart = new Date();
        midnightStart.setHours(0, 0, 0, 0);
        dayObj.start = midnightStart.getTime();
        dayObj.total += calculateMinutes(dayObj.start, dayObj.end);
        byYear[year].total += calculateMinutes(dayObj.start, dayObj.end);
        weekObj.total += calculateMinutes(dayObj.start, dayObj.end);
      }
    } else {
      //create new array for the new year

      activity.activityByYear.push(createYearData(year));

      //set yesterday counter
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const weekObjYesterday = byYear[year].weeks.find(
        (e: Week) => e.week === weekOfYear(yesterday)
      );
      const dayObjYesterday = weekObjYesterday.days.find(
        (d: Day) => d.day === yesterday.getDay()
      );

      dayObjYesterday.end = yesterday.getTime();
      dayObjYesterday.total += calculateMinutes(
        dayObjYesterday.start,
        dayObjYesterday.end
      );
      byYear[year].total += calculateMinutes(
        dayObjYesterday.start,
        dayObjYesterday.end
      );
      weekObjYesterday.total += calculateMinutes(
        dayObjYesterday.start,
        dayObjYesterday.end
      );

      const weekObj = byYear[year].weeks.find((e: Week) => e.week === week);

      const dayObj = weekObj.days.find((d: Day) => d.day === day);

      // set Today counter
      dayObj.end = Date.now();
      const midnightStart = new Date();
      midnightStart.setHours(0, 0, 0, 0);
      dayObj.start = midnightStart.getTime();
      dayObj.total += calculateMinutes(dayObj.start, dayObj.end);
      byYear[year].total += calculateMinutes(dayObj.start, dayObj.end);
      weekObj.total += calculateMinutes(dayObj.start, dayObj.end);
    }
    activity.markModified("activityByYear");

    await userConcerned.save();

    res.status(200).json(userConcerned);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
